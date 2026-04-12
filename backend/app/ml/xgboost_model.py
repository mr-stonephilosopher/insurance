import xgboost as xgb
import pandas as pd
import numpy as np
import shap
from typing import Dict, List, Any, Tuple
import pickle
import os
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.postgres import Claim

logger = logging.getLogger(__name__)

class XGBoostFraudDetector:
    def __init__(self):
        self.model = None
        self.feature_columns = [
            'claim_amount', 'amount_vs_avg_ratio', 'time_since_last_claim',
            'claims_last_30d', 'claims_last_90d', 'diagnosis_risk_score',
            'hospital_risk_score', 'doctor_risk_score', 'policyholder_risk_score',
            'is_weekend_claim', 'is_holiday_claim', 'amount_deviation_score',
            'billing_pattern_anomaly', 'diagnosis_amount_mismatch'
        ]
        self.model_path = "xgboost_fraud_model.pkl"
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model or create new one"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Loaded existing XGBoost model")
            else:
                self.model = xgb.XGBClassifier(
                    objective='binary:logistic',
                    eval_metric='auc',
                    max_depth=6,
                    learning_rate=0.1,
                    n_estimators=100,
                    random_state=42
                )
                logger.info("Created new XGBoost model")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = xgb.XGBClassifier(
                objective='binary:logistic',
                eval_metric='auc',
                max_depth=6,
                learning_rate=0.1,
                n_estimators=100,
                random_state=42
            )
    
    def save_model(self):
        """Save the trained model"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            logger.info("Model saved successfully")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def extract_features(self, claim_data: Dict[str, Any], db: Session) -> np.ndarray:
        """Extract features for a claim from database and claim data"""
        features = {}
        
        # Basic claim features
        features['claim_amount'] = claim_data.get('total_amount', 0)
        
        # Historical features from database
        policyholder_id = claim_data.get('policyholder_id')
        if policyholder_id:
            historical_claims = db.query(Claim).filter(
                Claim.policyholder_id == policyholder_id,
                Claim.claim_id != claim_data.get('claim_id')
            ).all()
            
            # Time-based features
            if historical_claims:
                last_claim = max(historical_claims, key=lambda x: x.timestamp)
                time_since_last = (datetime.utcnow() - last_claim.timestamp).days
                features['time_since_last_claim'] = time_since_last
                
                # Recent claim counts
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                ninety_days_ago = datetime.utcnow() - timedelta(days=90)
                
                features['claims_last_30d'] = len([c for c in historical_claims if c.timestamp >= thirty_days_ago])
                features['claims_last_90d'] = len([c for c in historical_claims if c.timestamp >= ninety_days_ago])
                
                # Average claim amount comparison
                avg_amount = np.mean([c.total_amount for c in historical_claims])
                features['amount_vs_avg_ratio'] = claim_data.get('total_amount', 0) / avg_amount if avg_amount > 0 else 1
            else:
                features['time_since_last_claim'] = 999  # First claim
                features['claims_last_30d'] = 0
                features['claims_last_90d'] = 0
                features['amount_vs_avg_ratio'] = 1
        
        # Risk scores based on historical patterns
        features['diagnosis_risk_score'] = self._get_diagnosis_risk_score(claim_data.get('diagnosis_code'), db)
        features['hospital_risk_score'] = self._get_hospital_risk_score(claim_data.get('hospital_id'), db)
        features['doctor_risk_score'] = self._get_doctor_risk_score(claim_data.get('attending_doctor_id'), db)
        features['policyholder_risk_score'] = self._get_policyholder_risk_score(policyholder_id, db)
        
        # Temporal features
        claim_date = claim_data.get('service_date') or claim_data.get('timestamp')
        if claim_date:
            features['is_weekend_claim'] = claim_date.weekday() >= 5
            features['is_holiday_claim'] = self._is_holiday(claim_date)
        else:
            features['is_weekend_claim'] = False
            features['is_holiday_claim'] = False
        
        # Amount-based anomaly features
        features['amount_deviation_score'] = self._calculate_amount_deviation(claim_data.get('total_amount', 0), db)
        features['billing_pattern_anomaly'] = self._detect_billing_anomaly(claim_data, db)
        features['diagnosis_amount_mismatch'] = self._detect_diagnosis_amount_mismatch(claim_data, db)
        
        # Convert to numpy array in correct order
        feature_array = np.array([features.get(col, 0) for col in self.feature_columns])
        return feature_array.reshape(1, -1)
    
    def predict_fraud_probability(self, claim_data: Dict[str, Any], db: Session) -> Tuple[float, List[str]]:
        """Predict fraud probability and return risk factors"""
        try:
            features = self.extract_features(claim_data, db)
            
            # Get prediction probability
            fraud_probability = float(self.model.predict_proba(features)[0][1])
            
            # Get risk factors using feature importance
            risk_factors = self._get_risk_factors(claim_data, features, db)
            
            return fraud_probability, risk_factors
            
        except Exception as e:
            logger.error(f"Error in fraud prediction: {e}")
            return 0.5, ["Model prediction error"]
    
    def _get_risk_factors(self, claim_data: Dict[str, Any], features: np.ndarray, db: Session) -> List[str]:
        """Identify specific risk factors for the claim"""
        risk_factors = []
        
        claim_amount = claim_data.get('total_amount', 0)
        
        # High amount risk
        if claim_amount > 10000:
            risk_factors.append("High claim amount")
        
        # Frequent claims
        policyholder_id = claim_data.get('policyholder_id')
        if policyholder_id:
            recent_claims = db.query(Claim).filter(
                Claim.policyholder_id == policyholder_id,
                Claim.timestamp >= datetime.utcnow() - timedelta(days=30)
            ).count()
            
            if recent_claims > 3:
                risk_factors.append("Multiple recent claims")
        
        # Amount deviation
        amount_deviation = self._calculate_amount_deviation(claim_amount, db)
        if amount_deviation > 2.0:
            risk_factors.append("Amount significantly above average")
        
        # New policyholder risk
        historical_claims = db.query(Claim).filter(
            Claim.policyholder_id == policyholder_id
        ).count() if policyholder_id else 0
        
        if historical_claims == 0:
            risk_factors.append("First-time claimant")
        
        # Diagnosis-amount mismatch
        if self._detect_diagnosis_amount_mismatch(claim_data, db) > 0.7:
            risk_factors.append("Diagnosis-amount pattern mismatch")
        
        return risk_factors
    
    def _calculate_amount_deviation(self, amount: float, db: Session) -> float:
        """Calculate how much the amount deviates from the average"""
        try:
            avg_amount = db.query(Claim.total_amount).filter(
                Claim.total_amount > 0
            ).all()
            
            if avg_amount:
                amounts = [a[0] for a in avg_amount]
                mean_amount = np.mean(amounts)
                std_amount = np.std(amounts)
                
                if std_amount > 0:
                    return abs(amount - mean_amount) / std_amount
            
            return 1.0
        except Exception:
            return 1.0
    
    def _detect_billing_anomaly(self, claim_data: Dict[str, Any], db: Session) -> float:
        """Detect anomalies in billing patterns"""
        # Simplified anomaly detection based on itemized billing
        itemized_billing = claim_data.get('itemized_billing', [])
        
        if not itemized_billing:
            return 0.0
        
        # Check for unusual patterns like many small items or round numbers
        anomaly_score = 0.0
        
        # Many items might indicate fragmentation
        if len(itemized_billing) > 10:
            anomaly_score += 0.3
        
        # Round number amounts
        for item in itemized_billing:
            amount = item.get('amount', 0)
            if amount > 0 and amount == round(amount):
                anomaly_score += 0.1
        
        return min(anomaly_score, 1.0)
    
    def _detect_diagnosis_amount_mismatch(self, claim_data: Dict[str, Any], db: Session) -> float:
        """Detect if the amount is unusual for the diagnosis"""
        diagnosis_code = claim_data.get('diagnosis_code')
        amount = claim_data.get('total_amount', 0)
        
        if not diagnosis_code:
            return 0.0
        
        try:
            # Get average amount for this diagnosis
            diagnosis_claims = db.query(Claim.total_amount).filter(
                Claim.diagnosis_code == diagnosis_code,
                Claim.total_amount > 0
            ).all()
            
            if diagnosis_claims:
                amounts = [c[0] for c in diagnosis_claims]
                avg_amount = np.mean(amounts)
                
                if avg_amount > 0:
                    ratio = amount / avg_amount
                    # High ratio indicates potential mismatch
                    return min(ratio / 3.0, 1.0)  # Normalize to 0-1
            
            return 0.0
        except Exception:
            return 0.0
    
    def _get_diagnosis_risk_score(self, diagnosis_code: str, db: Session) -> float:
        """Calculate risk score based on diagnosis code"""
        if not diagnosis_code:
            return 0.5
        
        try:
            # Check if this diagnosis has high fraud rate historically
            diagnosis_claims = db.query(Claim).filter(Claim.diagnosis_code == diagnosis_code).all()
            
            if not diagnosis_claims:
                return 0.5
            
            # Simple risk based on claim frequency and amounts
            fraud_flags = len([c for c in diagnosis_claims if c.fraud_score and c.fraud_score > 0.7])
            total_claims = len(diagnosis_claims)
            
            return min(fraud_flags / total_claims * 2, 1.0) if total_claims > 0 else 0.5
        except Exception:
            return 0.5
    
    def _get_hospital_risk_score(self, hospital_id: str, db: Session) -> float:
        """Calculate risk score based on hospital"""
        if not hospital_id:
            return 0.5
        
        try:
            hospital_claims = db.query(Claim).filter(Claim.hospital_id == hospital_id).all()
            
            if not hospital_claims:
                return 0.5
            
            fraud_flags = len([c for c in hospital_claims if c.fraud_score and c.fraud_score > 0.7])
            return min(fraud_flags / len(hospital_claims) * 2, 1.0)
        except Exception:
            return 0.5
    
    def _get_doctor_risk_score(self, doctor_id: str, db: Session) -> float:
        """Calculate risk score based on doctor"""
        if not doctor_id:
            return 0.5
        
        try:
            doctor_claims = db.query(Claim).filter(Claim.attending_doctor_id == doctor_id).all()
            
            if not doctor_claims:
                return 0.5
            
            fraud_flags = len([c for c in doctor_claims if c.fraud_score and c.fraud_score > 0.7])
            return min(fraud_flags / len(doctor_claims) * 2, 1.0)
        except Exception:
            return 0.5
    
    def _get_policyholder_risk_score(self, policyholder_id: str, db: Session) -> float:
        """Calculate risk score based on policyholder history"""
        if not policyholder_id:
            return 0.5
        
        try:
            policyholder_claims = db.query(Claim).filter(Claim.policyholder_id == policyholder_id).all()
            
            if not policyholder_claims:
                return 0.3  # Lower risk for new policyholders
            
            fraud_flags = len([c for c in policyholder_claims if c.fraud_score and c.fraud_score > 0.7])
            return min(fraud_flags / len(policyholder_claims) * 2, 1.0)
        except Exception:
            return 0.5
    
    def _is_holiday(self, date: datetime) -> bool:
        """Check if date is a holiday (simplified)"""
        # This is a simplified version - in production, use a proper holiday calendar
        holidays = [
            (1, 1),   # New Year
            (12, 25), # Christmas
            (7, 4),   # Independence Day (US)
        ]
        return (date.month, date.day) in holidays
    
    def generate_shap_explanation(self, claim_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Generate SHAP explanation for the prediction"""
        try:
            features = self.extract_features(claim_data, db)
            
            # Create SHAP explainer
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(features)
            
            # Get feature importance
            feature_importance = {}
            for i, feature_name in enumerate(self.feature_columns):
                feature_importance[feature_name] = float(shap_values[0][i])
            
            # Generate explanation text
            top_features = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
            
            explanation_parts = []
            for feature, importance in top_features:
                if importance > 0:
                    explanation_parts.append(f"{feature.replace('_', ' ').title()} increases fraud risk")
                else:
                    explanation_parts.append(f"{feature.replace('_', ' ').title()} decreases fraud risk")
            
            explanation_text = "Score is influenced by: " + ", ".join(explanation_parts)
            
            return {
                'feature_importance': feature_importance,
                'base_value': float(explainer.expected_value[1]),
                'explanation_text': explanation_text,
                'risk_factors': [f for f, imp in top_features if imp > 0]
            }
            
        except Exception as e:
            logger.error(f"Error generating SHAP explanation: {e}")
            return {
                'feature_importance': {},
                'base_value': 0.5,
                'explanation_text': "Unable to generate explanation",
                'risk_factors': ["Model explanation error"]
            }

# Global model instance
xgboost_detector = XGBoostFraudDetector()
