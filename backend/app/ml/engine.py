import numpy as np
import xgboost as xgb
import shap
import random

class FraudEngine:
    def __init__(self):
        # In a real system, we would load a pre-trained model.
        # For this hackathon, we'll simulate the XGBoost and SHAP part.
        pass

    def calculate_pricing_anomaly(self, amount, diagnosis_code):
        # Simulated logic: If amount is > 3x average for diagnosis, flag it.
        averages = {
            "A10": 5000,   # Example: Common cold
            "B20": 50000,  # Example: Surgery
            "C30": 150000, # Example: Major treatment
        }
        avg = averages.get(diagnosis_code, 20000)
        
        if amount > avg * 3:
            return 80 + random.randint(0, 20), [f"Billing is {amount/avg:.1f}x the standard deviation for {diagnosis_code}"]
        elif amount > avg * 1.5:
            return 40 + random.randint(0, 10), [f"Billing is slightly higher than average for {diagnosis_code}"]
        
        return random.randint(5, 15), []

    def calculate_network_risk(self, doctor_id, agent_id):
        # Simulated Louvain/Community detection logic
        # If doctor_id is "DOC-FRAUD-1" or agent_id is "AGENT-FRAUD-1", high risk.
        if doctor_id == "DOC-FRAUD-1" or agent_id == "AGENT-FRAUD-1":
            return 90, ["Entity belongs to a known high-risk fraud cluster."]
        return 0, []

    def get_final_score(self, claim_data):
        pricing_score, pricing_reasons = self.calculate_pricing_anomaly(
            claim_data["total_amount"], 
            claim_data["diagnosis_code"]
        )
        network_score, network_reasons = self.calculate_network_risk(
            claim_data["doctor_id"], 
            claim_data["agent_id"]
        )
        
        final_score = max(pricing_score, network_score)
        reasons = pricing_reasons + network_reasons
        
        # Simulated SHAP explanation
        explanation = {
            "score": final_score,
            "reasons": reasons,
            "shap_values": {
                "amount": pricing_score / 100,
                "network": network_score / 100,
                "history": 0.1
            }
        }
        
        return final_score, explanation

fraud_engine = FraudEngine()
