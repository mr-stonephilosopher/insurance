-- Initialize PostgreSQL database for fraud detection system
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_policyholder_id ON claims(policyholder_id);
CREATE INDEX IF NOT EXISTS idx_claims_hospital_id ON claims(hospital_id);
CREATE INDEX IF NOT EXISTS idx_claims_attending_doctor_id ON claims(attending_doctor_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_severity ON claims(severity);
CREATE INDEX IF NOT EXISTS idx_claims_fraud_score ON claims(fraud_score);
CREATE INDEX IF NOT EXISTS idx_claims_submission_timestamp ON claims(submission_timestamp);
CREATE INDEX IF NOT EXISTS idx_claims_cluster_id ON claims(cluster_id);
CREATE INDEX IF NOT EXISTS idx_fraud_rings_cluster_id ON fraud_rings(cluster_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_claim_id ON audit_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create sample data for testing (optional)
-- This can be removed or commented out in production

INSERT INTO claims (
    claim_id, 
    patient_name, 
    total_amount, 
    diagnosis_code, 
    timestamp, 
    status, 
    severity, 
    fraud_score,
    source,
    hospital_id,
    attending_doctor_id,
    policyholder_id,
    submission_timestamp
) VALUES 
    ('CLAIM-001', 'user1', 1500.00, 'A01.0', NOW(), 'pending', 'LOW', 25.5, 'B2B', 'identity1', 'identity2', 'identity1', NOW()),
    ('CLAIM-002', 'user2', 8500.00, 'M54.5', NOW(), 'pending', 'HIGH', 78.2, 'B2B', 'identity2', 'identity3', 'identity2', NOW()),
    ('CLAIM-003', 'user3', 3200.00, 'J44.9', NOW(), 'approved', 'MEDIUM', 45.0, 'CONSUMER', NULL, NULL, 'identity3', NOW())
ON CONFLICT (claim_id) DO NOTHING;

-- Create stored procedures for common operations
CREATE OR REPLACE FUNCTION update_claim_fraud_analysis(
    p_claim_id VARCHAR(100),
    p_fraud_score FLOAT,
    p_severity VARCHAR(50),
    p_xgboost_score FLOAT,
    p_louvain_score FLOAT,
    p_cluster_id VARCHAR(100),
    p_is_fraud_ring BOOLEAN,
    p_requires_human_review BOOLEAN,
    p_recommendation TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE claims 
    SET 
        fraud_score = p_fraud_score,
        severity = p_severity,
        xgboost_score = p_xgboost_score,
        louvain_score = p_louvain_score,
        cluster_id = p_cluster_id,
        is_fraud_ring = p_is_fraud_ring,
        requires_human_review = p_requires_human_review,
        recommendation = p_recommendation,
        updated_at = NOW()
    WHERE claim_id = p_claim_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for dashboard analytics
CREATE OR REPLACE VIEW claim_analytics AS
SELECT 
    status,
    severity,
    COUNT(*) as claim_count,
    AVG(total_amount) as avg_amount,
    AVG(fraud_score) as avg_fraud_score,
    MAX(fraud_score) as max_fraud_score,
    MIN(fraud_score) as min_fraud_score
FROM claims 
GROUP BY status, severity;

-- Create view for fraud ring analysis
CREATE OR REPLACE VIEW fraud_ring_analytics AS
SELECT 
    fr.cluster_id,
    fr.risk_score,
    fr.active_claims_count,
    fr.total_suspicious_amount,
    COUNT(c.claim_id) as total_claims_in_ring,
    AVG(c.fraud_score) as avg_ring_fraud_score
FROM fraud_rings fr
LEFT JOIN claims c ON fr.cluster_id = c.cluster_id
GROUP BY fr.cluster_id, fr.risk_score, fr.active_claims_count, fr.total_suspicious_amount;
