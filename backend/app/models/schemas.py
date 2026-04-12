from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ClaimStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    UNDER_INVESTIGATION = "under_investigation"

class ClaimSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Phase 1: B2B FHIR Payload Model
class FHIRClaim(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    resource_type: str = Field(default="Claim", description="FHIR resource type")
    hospital_id: str = Field(..., description="Hospital/Institution ID")
    attending_doctor_id: str = Field(..., description="Attending Doctor ID")
    policyholder_id: str = Field(..., description="Policyholder ID")
    patient_name: str = Field(..., description="Patient name")
    diagnosis_code: str = Field(..., description="ICD-10 diagnosis code")
    itemized_billing: List[Dict[str, Any]] = Field(..., description="Itemized billing details")
    total_amount: float = Field(..., description="Total claim amount")
    service_date: datetime = Field(..., description="Date of service")
    submission_timestamp: datetime = Field(default_factory=datetime.now)

# Phase 1: Direct Consumer Payload Model
class ConsumerClaim(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    policyholder_id: str = Field(..., description="Policyholder ID")
    patient_name: str = Field(..., description="Patient name")
    claim_amount: float = Field(..., description="Claim amount")
    claim_date: datetime = Field(..., description="Claim date")
    diagnosis_description: Optional[str] = Field(None, description="Diagnosis description")
    google_play_integrity_token: str = Field(..., description="Google Play Integrity token")
    digilocker_verification_hash: str = Field(..., description="DigiLocker API verification hash")
    mediapipe_liveness_passed: bool = Field(..., description="MediaPipe liveness check result")
    submission_timestamp: datetime = Field(default_factory=datetime.now)

# Phase 2: PostgreSQL Storage Model
class ClaimRecord(BaseModel):
    claim_id: str
    patient_name: str
    total_amount: float
    diagnosis_code: Optional[str] = None
    diagnosis_description: Optional[str] = None
    timestamp: datetime
    status: ClaimStatus = ClaimStatus.PENDING
    severity: ClaimSeverity = ClaimSeverity.LOW
    fraud_score: Optional[float] = None
    shap_explanation: Optional[Dict[str, Any]] = None
    source: str  # "B2B" or "CONSUMER"

# Phase 2: Neo4j Node Models
class Neo4jNode(BaseModel):
    id: str
    labels: List[str]
    properties: Dict[str, Any]

class Neo4jRelationship(BaseModel):
    start_node: str
    end_node: str
    relationship_type: str
    properties: Dict[str, Any]

# Phase 3: ML Model Outputs
class XGBoostPrediction(BaseModel):
    claim_id: str
    fraud_probability: float
    risk_factors: List[str]
    confidence_score: float

class LouvainClusterResult(BaseModel):
    claim_id: str
    cluster_id: str
    is_fraud_ring: bool
    connected_entities: List[str]
    anomaly_score: float

# Phase 4: Final Fraud Score and SHAP Explanation
class SHAPExplanation(BaseModel):
    feature_importance: Dict[str, float]
    base_value: float
    explanation_text: str
    risk_factors: List[str]

class FinalFraudScore(BaseModel):
    claim_id: str
    final_score: float  # 0-100
    xgboost_score: float
    louvain_score: float
    severity: ClaimSeverity
    shap_explanation: SHAPExplanation
    recommendation: str
    requires_human_review: bool

# Dashboard Models
class ClaimDashboard(BaseModel):
    claim_id: str
    patient_name: str
    total_amount: float
    fraud_score: float
    severity: ClaimSeverity
    status: ClaimStatus
    submission_date: datetime
    shap_summary: str
    requires_review: bool
