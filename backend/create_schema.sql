-- Create basic schema for BitWizard Insurance Fraud Detection System

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    aadhaar VARCHAR(14) UNIQUE,
    pan VARCHAR(10) UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(6),
    digilocker_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create insurers table
CREATE TABLE IF NOT EXISTS insurers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    website VARCHAR(100),
    irda_registration VARCHAR(20),
    gst_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    claim_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    insurer_id INTEGER REFERENCES insurers(id),
    claim_type VARCHAR(20) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    diagnosis_code VARCHAR(50),
    diagnosis_description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    severity VARCHAR(50) DEFAULT 'low',
    fraud_score DECIMAL(3,2),
    shap_explanation JSONB,
    source VARCHAR(50) NOT NULL,
    hospital_id VARCHAR(100),
    attending_doctor_id VARCHAR(100),
    policyholder_id VARCHAR(100) NOT NULL,
    cluster_id VARCHAR(100),
    is_fraud_ring BOOLEAN DEFAULT FALSE,
    xgboost_score DECIMAL(3,2),
    louvain_score DECIMAL(3,2),
    requires_human_review BOOLEAN DEFAULT FALSE,
    recommendation TEXT,
    google_play_integrity_token TEXT,
    digilocker_verification_hash TEXT,
    mediapipe_liveness_passed BOOLEAN,
    itemized_billing JSONB,
    service_date TIMESTAMP,
    submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    documents TEXT,
    ai_summary TEXT,
    risk_factors TEXT,
    processed_date TIMESTAMP,
    reviewed_by VARCHAR(100)
);

-- Create fraud_rings table
CREATE TABLE IF NOT EXISTS fraud_rings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id VARCHAR(100) UNIQUE NOT NULL,
    entity_ids JSONB NOT NULL,
    detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_score DECIMAL(3,2) NOT NULL,
    active_claims_count INTEGER DEFAULT 0,
    historical_claims_count INTEGER DEFAULT 0,
    total_suspicious_amount DECIMAL(12,2) DEFAULT 0.0
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    previous_state JSONB,
    new_state JSONB
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_customers_aadhaar ON customers(aadhaar);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_insurers_license ON insurers(license_number);
CREATE INDEX IF NOT EXISTS idx_claims_id ON claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_customer_id ON claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_insurer_id ON claims(insurer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_fraud_score ON claims(fraud_score);
CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON claims(submission_timestamp);
