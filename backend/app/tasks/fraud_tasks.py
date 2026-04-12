from .worker import app
from ..core.database import SessionLocal
from ..models.postgres import Claim
from ..core.graph import graph_db
from ..ml.engine import fraud_engine

@app.task(name="app.tasks.fraud_tasks.process_claim_async")
def process_claim_async(claim_id: str):
    db = SessionLocal()
    try:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return f"Claim {claim_id} not found"

        # 1. Sync to Neo4j
        graph_db.create_claim_nodes(
            claim.id, 
            claim.patient_name, 
            claim.doctor_id, 
            claim.hospital_id, 
            claim.agent_id
        )

        # 2. Run AI/ML Models
        claim_data = {
            "total_amount": claim.total_amount,
            "diagnosis_code": claim.diagnosis_code,
            "doctor_id": claim.doctor_id,
            "agent_id": claim.agent_id
        }
        
        score, explanation = fraud_engine.get_final_score(claim_data)

        # 3. Update PostgreSQL with results
        claim.fraud_score = score
        claim.shap_explanation = explanation
        claim.status = "processed"
        
        db.commit()
        return f"Claim {claim_id} processed with score {score}"

    except Exception as e:
        db.rollback()
        return f"Error processing claim {claim_id}: {str(e)}"
    finally:
        db.close()
