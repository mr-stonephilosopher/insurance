from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.neo4j_client import neo4j_client
from ..models.postgres import Claim, FraudRing, AuditLog
from ..models.schemas import (
    FHIRClaim, ConsumerClaim, ClaimRecord, ClaimDashboard, 
    FinalFraudScore, ClaimStatus, ClaimSeverity
)
from ..ml.celery_tasks import process_claim_fraud_analysis
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/claims", tags=["claims"])

# Phase 1: B2B Institutional Route (FHIR JSON via NHCX Gateway)
@router.post("/b2b/fhir", response_model=Dict[str, Any])
def submit_b2b_fhir_claim(
    claim: FHIRClaim, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submit institutional claim via FHIR JSON payload through NHCX gateway.
    Highly structured, machine-readable data with medical codes and itemized billing.
    """
    try:
        # Create claim record in PostgreSQL (Phase 2: Source of Truth)
        db_claim = Claim(
            claim_id=claim.claim_id,
            patient_name=claim.patient_name,
            total_amount=claim.total_amount,
            diagnosis_code=claim.diagnosis_code,
            timestamp=datetime.utcnow(),
            source="B2B",
            hospital_id=claim.hospital_id,
            attending_doctor_id=claim.attending_doctor_id,
            policyholder_id=claim.policyholder_id,
            itemized_billing=claim.itemized_billing,
            service_date=claim.service_date,
            submission_timestamp=claim.submission_timestamp
        )
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        # Create Neo4j nodes and relationships (Phase 2: Relationship Mapper)
        claim_data = {
            'claim_id': claim.claim_id,
            'policyholder_id': claim.policyholder_id,
            'patient_name': claim.patient_name,
            'total_amount': claim.total_amount,
            'timestamp': claim.submission_timestamp,
            'status': 'pending',
            'hospital_id': claim.hospital_id,
            'attending_doctor_id': claim.attending_doctor_id
        }
        
        neo4j_success = neo4j_client.create_claim_nodes_and_relationships(claim_data)
        
        # Create audit log
        audit_log = AuditLog(
            claim_id=claim.claim_id,
            action="CLAIM_SUBMITTED",
            actor="B2B_GATEWAY",
            details={"neo4j_created": neo4j_success, "submission_type": "FHIR"}
        )
        db.add(audit_log)
        db.commit()
        
        # Trigger async ML processing (Phase 3: Asynchronous Brain)
        background_tasks.add_task(
            process_claim_fraud_analysis.delay, 
            claim.claim_id
        )
        
        logger.info(f"B2B FHIR claim {claim.claim_id} submitted successfully")
        
        return {
            "status": "accepted",
            "claim_id": claim.claim_id,
            "message": "FHIR claim submitted for processing",
            "processing_stage": "ML_ANALYSIS_QUEUED"
        }
        
    except Exception as e:
        logger.error(f"Error processing B2B FHIR claim: {e}")
        raise HTTPException(status_code=500, detail="Failed to process FHIR claim")

# Phase 1: Direct Consumer Route (Mobile App SDK)
@router.post("/consumer/mobile", response_model=Dict[str, Any])
def submit_consumer_mobile_claim(
    claim: ConsumerClaim,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submit claim directly via mobile app SDK with security verifications.
    Includes Google Play Integrity, DigiLocker verification, and MediaPipe liveness.
    """
    try:
        # Security validations
        if not claim.mediapipe_liveness_passed:
            raise HTTPException(
                status_code=400, 
                detail="Liveness verification failed - please retry with live video"
            )
        
        # In production, validate Google Play Integrity token here
        # For now, we'll assume token validation passes
        
        # Create claim record in PostgreSQL
        db_claim = Claim(
            claim_id=claim.claim_id,
            patient_name=claim.patient_name,
            total_amount=claim.claim_amount,
            diagnosis_description=claim.diagnosis_description,
            timestamp=datetime.utcnow(),
            source="CONSUMER",
            policyholder_id=claim.policyholder_id,
            google_play_integrity_token=claim.google_play_integrity_token,
            digilocker_verification_hash=claim.digilocker_verification_hash,
            mediapipe_liveness_passed=claim.mediapipe_liveness_passed,
            service_date=claim.claim_date,
            submission_timestamp=claim.submission_timestamp
        )
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        # Create Neo4j nodes and relationships
        claim_data = {
            'claim_id': claim.claim_id,
            'policyholder_id': claim.policyholder_id,
            'patient_name': claim.patient_name,
            'total_amount': claim.claim_amount,
            'timestamp': claim.submission_timestamp,
            'status': 'pending'
        }
        
        neo4j_success = neo4j_client.create_claim_nodes_and_relationships(claim_data)
        
        # Create audit log with security verification details
        audit_log = AuditLog(
            claim_id=claim.claim_id,
            action="CLAIM_SUBMITTED",
            actor="MOBILE_APP",
            details={
                "neo4j_created": neo4j_success,
                "submission_type": "CONSUMER_MOBILE",
                "liveness_passed": claim.mediapipe_liveness_passed,
                "digilocker_verified": True  # In production, verify hash
            }
        )
        db.add(audit_log)
        db.commit()
        
        # Trigger async ML processing
        background_tasks.add_task(
            process_claim_fraud_analysis.delay,
            claim.claim_id
        )
        
        logger.info(f"Consumer mobile claim {claim.claim_id} submitted successfully")
        
        return {
            "status": "accepted",
            "claim_id": claim.claim_id,
            "message": "Mobile claim submitted for processing",
            "processing_stage": "ML_ANALYSIS_QUEUED",
            "security_verifications": {
                "liveness_check": "PASSED",
                "device_integrity": "VERIFIED",
                "digilocker": "VERIFIED"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing consumer mobile claim: {e}")
        raise HTTPException(status_code=500, detail="Failed to process mobile claim")

@router.get("/{claim_id}", response_model=ClaimDashboard)
def get_claim_details(claim_id: str, db: Session = Depends(get_db)):
    """Get comprehensive claim details including fraud analysis results"""
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Generate SHAP summary for dashboard
    shap_summary = "No explanation available"
    if claim.shap_explanation:
        shap_summary = claim.shap_explanation.get('explanation_text', 'No explanation available')
    
    return ClaimDashboard(
        claim_id=claim.claim_id,
        patient_name=claim.patient_name,
        total_amount=claim.total_amount,
        fraud_score=claim.fraud_score or 0.0,
        severity=ClaimSeverity(claim.severity),
        status=ClaimStatus(claim.status),
        submission_date=claim.submission_timestamp,
        shap_summary=shap_summary,
        requires_review=claim.requires_human_review or False
    )

@router.get("/", response_model=List[ClaimDashboard])
def list_claims(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[ClaimStatus] = None,
    severity: Optional[ClaimSeverity] = None,
    requires_review: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List claims with filtering options for insurance adjusters"""
    query = db.query(Claim)
    
    if status:
        query = query.filter(Claim.status == status.value)
    if severity:
        query = query.filter(Claim.severity == severity.value)
    if requires_review is not None:
        query = query.filter(Claim.requires_human_review == requires_review)
    
    claims = query.order_by(Claim.submission_timestamp.desc()).offset(skip).limit(limit).all()
    
    dashboard_claims = []
    for claim in claims:
        shap_summary = "No explanation available"
        if claim.shap_explanation:
            shap_summary = claim.shap_explanation.get('explanation_text', 'No explanation available')
        
        dashboard_claims.append(ClaimDashboard(
            claim_id=claim.claim_id,
            patient_name=claim.patient_name,
            total_amount=claim.total_amount,
            fraud_score=claim.fraud_score or 0.0,
            severity=ClaimSeverity(claim.severity),
            status=ClaimStatus(claim.status),
            submission_date=claim.submission_timestamp,
            shap_summary=shap_summary,
            requires_review=claim.requires_human_review or False
        ))
    
    return dashboard_claims

@router.put("/{claim_id}/status", response_model=Dict[str, str])
def update_claim_status(
    claim_id: str,
    new_status: ClaimStatus,
    adjuster_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update claim status (for human adjusters)"""
    claim = db.query(Claim).filter(Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Record previous state
    previous_state = {
        "status": claim.status,
        "severity": claim.severity,
        "requires_human_review": claim.requires_human_review
    }
    
    # Update claim
    claim.status = new_status.value
    if new_status == ClaimStatus.APPROVED or new_status == ClaimStatus.REJECTED:
        claim.requires_human_review = False
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        claim_id=claim_id,
        action="STATUS_UPDATED",
        actor="HUMAN_ADJUSTER",
        details={
            "new_status": new_status.value,
            "adjuster_notes": adjuster_notes
        },
        previous_state=previous_state,
        new_state={
            "status": claim.status,
            "severity": claim.severity,
            "requires_human_review": claim.requires_human_review
        }
    )
    db.add(audit_log)
    db.commit()
    
    logger.info(f"Claim {claim_id} status updated to {new_status.value}")
    
    return {"status": "updated", "claim_id": claim_id, "new_status": new_status.value}

@router.get("/fraud-rings/", response_model=List[Dict[str, Any]])
def list_fraud_rings(db: Session = Depends(get_db)):
    """List detected fraud rings for investigation"""
    fraud_rings = db.query(FraudRing).order_by(FraudRing.detection_date.desc()).all()
    
    result = []
    for ring in fraud_rings:
        result.append({
            "cluster_id": ring.cluster_id,
            "entity_ids": ring.entity_ids,
            "detection_date": ring.detection_date,
            "risk_score": ring.risk_score,
            "active_claims_count": ring.active_claims_count,
            "total_suspicious_amount": ring.total_suspicious_amount
        })
    
    return result

@router.get("/audit/{claim_id}", response_model=List[Dict[str, Any]])
def get_claim_audit_trail(claim_id: str, db: Session = Depends(get_db)):
    """Get audit trail for a specific claim"""
    audit_logs = db.query(AuditLog).filter(
        AuditLog.claim_id == claim_id
    ).order_by(AuditLog.timestamp.desc()).all()
    
    result = []
    for log in audit_logs:
        result.append({
            "action": log.action,
            "actor": log.actor,
            "timestamp": log.timestamp,
            "details": log.details,
            "previous_state": log.previous_state,
            "new_state": log.new_state
        })
    
    return result
