from celery import Celery
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.neo4j_client import neo4j_client
from ..models.postgres import Claim, FraudRing
from ..models.schemas import FinalFraudScore, SHAPExplanation, ClaimSeverity
from .xgboost_model import xgboost_detector
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'fraud_detection',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery_app.task(bind=True, max_retries=3)
def process_claim_fraud_analysis(self, claim_id: str):
    """Process claim through both XGBoost and Louvain analysis"""
    try:
        # Get database session
        db = next(get_db())
        
        # Get claim data
        claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
        if not claim:
            logger.error(f"Claim {claim_id} not found")
            return
        
        claim_data = {
            'claim_id': claim.claim_id,
            'total_amount': claim.total_amount,
            'policyholder_id': claim.policyholder_id,
            'patient_name': claim.patient_name,
            'diagnosis_code': claim.diagnosis_code,
            'hospital_id': claim.hospital_id,
            'attending_doctor_id': claim.attending_doctor_id,
            'timestamp': claim.timestamp,
            'service_date': claim.service_date
        }
        
        # Run XGBoost analysis
        xgboost_probability, xgboost_risk_factors = xgboost_detector.predict_fraud_probability(claim_data, db)
        
        # Run Louvain analysis
        fraud_rings = neo4j_client.detect_fraud_rings_louvain()
        
        # Find if this claim is part of a fraud ring
        claim_cluster = None
        louvain_score = 0.0
        is_fraud_ring = False
        
        for ring in fraud_rings:
            if (claim.policyholder_id in ring['entities'] or 
                claim.attending_doctor_id in ring['entities'] or
                claim.hospital_id in ring['entities']):
                
                claim_cluster = ring['cluster_id']
                louvain_score = ring['risk_score'] / 100.0
                is_fraud_ring = ring['is_fraud_ring']
                break
        
        # Calculate final fraud score
        final_score = calculate_final_fraud_score(xgboost_probability, louvain_score, is_fraud_ring)
        
        # Generate SHAP explanation if score is high
        shap_explanation = None
        requires_human_review = final_score > 75
        
        if requires_human_review:
            shap_explanation = xgboost_detector.generate_shap_explanation(claim_data, db)
        
        # Update claim in database
        claim.fraud_score = final_score
        claim.xgboost_score = xgboost_probability
        claim.louvain_score = louvain_score
        claim.cluster_id = claim_cluster
        claim.is_fraud_ring = is_fraud_ring
        claim.requires_human_review = requires_human_review
        claim.severity = determine_severity(final_score)
        claim.recommendation = generate_recommendation(final_score, is_fraud_ring)
        
        if shap_explanation:
            claim.shap_explanation = shap_explanation
        
        db.commit()
        
        # Update Neo4j with fraud analysis results
        neo4j_client.update_claim_fraud_status(claim_id, final_score, claim_cluster)
        
        # Update fraud ring records
        if is_fraud_ring and claim_cluster:
            update_fraud_ring_record(claim_cluster, ring, db)
        
        logger.info(f"Completed fraud analysis for claim {claim_id}")
        
    except Exception as e:
        logger.error(f"Error processing claim {claim_id}: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (self.request.retries + 1))
        else:
            # Mark as failed after max retries
            try:
                db = next(get_db())
                claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
                if claim:
                    claim.status = 'failed'
                    claim.recommendation = "Fraud analysis failed - manual review required"
                    db.commit()
            except Exception as db_error:
                logger.error(f"Failed to update claim status: {db_error}")

@celery_app.task
def run_fraud_ring_detection():
    """Periodic task to detect fraud rings"""
    try:
        logger.info("Starting fraud ring detection")
        
        # Get all fraud rings from Neo4j
        fraud_rings = neo4j_client.detect_fraud_rings_louvain()
        
        # Update database with new fraud rings
        db = next(get_db())
        
        for ring in fraud_rings:
            if ring['is_fraud_ring']:
                # Check if fraud ring already exists
                existing_ring = db.query(FraudRing).filter(
                    FraudRing.cluster_id == ring['cluster_id']
                ).first()
                
                if not existing_ring:
                    # Create new fraud ring record
                    new_ring = FraudRing(
                        cluster_id=ring['cluster_id'],
                        entity_ids=ring['entities'],
                        risk_score=ring['risk_score'],
                        active_claims_count=ring['claim_count'],
                        total_suspicious_amount=ring['total_amount']
                    )
                    db.add(new_ring)
        
        db.commit()
        logger.info(f"Updated {len(fraud_rings)} fraud rings")
        
    except Exception as e:
        logger.error(f"Error in fraud ring detection: {e}")

def calculate_final_fraud_score(xgboost_score: float, louvain_score: float, is_fraud_ring: bool) -> float:
    """Calculate the final fraud score (0-100)"""
    # Base score from XGBoost
    base_score = xgboost_score * 100
    
    # Add Louvain component
    louvain_component = louvain_score * 100 * 0.3  # 30% weight
    
    # Add fraud ring penalty
    fraud_ring_penalty = 25 if is_fraud_ring else 0
    
    # Calculate final score
    final_score = base_score * 0.7 + louvain_component + fraud_ring_penalty
    
    return min(final_score, 100)  # Cap at 100

def determine_severity(fraud_score: float) -> ClaimSeverity:
    """Determine claim severity based on fraud score"""
    if fraud_score >= 90:
        return ClaimSeverity.CRITICAL
    elif fraud_score >= 75:
        return ClaimSeverity.HIGH
    elif fraud_score >= 50:
        return ClaimSeverity.MEDIUM
    else:
        return ClaimSeverity.LOW

def generate_recommendation(fraud_score: float, is_fraud_ring: bool) -> str:
    """Generate recommendation based on fraud analysis"""
    if fraud_score >= 90 or is_fraud_ring:
        return "IMMEDIATE INVESTIGATION REQUIRED - High fraud probability detected"
    elif fraud_score >= 75:
        return "DETAILED REVIEW REQUIRED - Multiple risk factors identified"
    elif fraud_score >= 50:
        return "STANDARD REVIEW - Moderate risk factors present"
    else:
        return "AUTO-APPROVE - Low risk detected"

def update_fraud_ring_record(cluster_id: str, ring_data: dict, db: Session):
    """Update fraud ring record with latest data"""
    try:
        existing_ring = db.query(FraudRing).filter(
            FraudRing.cluster_id == cluster_id
        ).first()
        
        if existing_ring:
            existing_ring.active_claims_count = ring_data['claim_count']
            existing_ring.total_suspicious_amount = ring_data['total_amount']
            existing_ring.risk_score = ring_data['risk_score']
        else:
            new_ring = FraudRing(
                cluster_id=cluster_id,
                entity_ids=ring_data['entities'],
                risk_score=ring_data['risk_score'],
                active_claims_count=ring_data['claim_count'],
                total_suspicious_amount=ring_data['total_amount']
            )
            db.add(new_ring)
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error updating fraud ring record: {e}")

# Schedule periodic fraud ring detection
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'detect-fraud-rings': {
        'task': 'app.ml.celery_tasks.run_fraud_ring_detection',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
}

celery_app.conf.timezone = 'UTC'
