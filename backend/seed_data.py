import uuid
import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine
from app.models.postgres import Base, Claim
from app.core.graph import graph_db

# Create tables if not exists
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    print("Seeding initial data...")
    
    # 1. Create a "Fraud Ring" (Doctor + Agent linked to many anomalous claims)
    fraud_doctor_id = "DOC-FRAUD-1"
    fraud_agent_id = "AGENT-FRAUD-1"
    hospital_id = "HOSP-MAX-001"
    
    # Create 10 anomalous claims for the fraud ring
    for i in range(10):
        claim_id = f"inst-fraud-{uuid.uuid4().hex[:6]}"
        amount = random.randint(300000, 600000) # Highly anomalous
        
        db_claim = Claim(
            id=claim_id,
            patient_name=f"Victim Patient {i}",
            total_amount=amount,
            diagnosis_code="A10", # Average cost is 5000, so this is 100x
            timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            hospital_id=hospital_id,
            doctor_id=fraud_doctor_id,
            agent_id=fraud_agent_id,
            source="institutional",
            status="processed",
            fraud_score=95,
            shap_explanation={"reasons": ["Extreme billing anomaly", "Known fraud cluster membership"]}
        )
        db.add(db_claim)
        
        # Sync to Neo4j
        graph_db.create_claim_nodes(
            claim_id, 
            db_claim.patient_name, 
            fraud_doctor_id, 
            hospital_id, 
            fraud_agent_id
        )

    # 2. Create 50 "Normal" claims
    for i in range(50):
        claim_id = f"inst-norm-{uuid.uuid4().hex[:6]}"
        amount = random.randint(3000, 8000) # Normal range for A10
        
        db_claim = Claim(
            id=claim_id,
            patient_name=f"Patient {i}",
            total_amount=amount,
            diagnosis_code="A10",
            timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
            hospital_id=f"HOSP-NORMAL-{random.randint(1, 5)}",
            doctor_id=f"DOC-NORMAL-{random.randint(1, 20)}",
            agent_id=f"AGT-NORMAL-{random.randint(1, 10)}",
            source="institutional",
            status="processed",
            fraud_score=random.randint(5, 15),
            shap_explanation={"reasons": ["Standard billing behavior"]}
        )
        db.add(db_claim)
        
        # Sync to Neo4j
        graph_db.create_claim_nodes(
            claim_id, 
            db_claim.patient_name, 
            db_claim.doctor_id, 
            db_claim.hospital_id, 
            db_claim.agent_id
        )

    db.commit()
    db.close()
    print("Seeding complete. 10 Fraud claims and 50 Normal claims added.")

if __name__ == "__main__":
    seed_data()
