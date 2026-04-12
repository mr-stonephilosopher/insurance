from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

Base = declarative_base()

class Claim(Base):
    __tablename__ = "claims"

    claim_id = Column(String(100), primary_key=True, index=True)
    patient_name = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    diagnosis_code = Column(String(50), nullable=True)
    diagnosis_description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected, under_investigation
    severity = Column(String(50), default="low", nullable=False)  # low, medium, high, critical
    fraud_score = Column(Float, nullable=True)
    shap_explanation = Column(JSON, nullable=True)
    source = Column(String(50), nullable=False)  # "B2B" or "CONSUMER"
    hospital_id = Column(String(100), nullable=True)
    attending_doctor_id = Column(String(100), nullable=True)
    policyholder_id = Column(String(100), nullable=False)
    cluster_id = Column(String(100), nullable=True)
    is_fraud_ring = Column(Boolean, default=False, nullable=False)
    xgboost_score = Column(Float, nullable=True)
    louvain_score = Column(Float, nullable=True)
    requires_human_review = Column(Boolean, default=False, nullable=False)
    recommendation = Column(Text, nullable=True)
    google_play_integrity_token = Column(Text, nullable=True)
    digilocker_verification_hash = Column(Text, nullable=True)
    mediapipe_liveness_passed = Column(Boolean, nullable=True)
    itemized_billing = Column(JSON, nullable=True)
    service_date = Column(DateTime, nullable=True)
    submission_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

class FraudRing(Base):
    __tablename__ = "fraud_rings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cluster_id = Column(String(100), unique=True, nullable=False, index=True)
    entity_ids = Column(JSON, nullable=False)  # List of connected entity IDs
    detection_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    risk_score = Column(Float, nullable=False)
    active_claims_count = Column(Integer, default=0, nullable=False)
    historical_claims_count = Column(Integer, default=0, nullable=False)
    total_suspicious_amount = Column(Float, default=0.0, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(String(100), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    actor = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    details = Column(JSON, nullable=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
