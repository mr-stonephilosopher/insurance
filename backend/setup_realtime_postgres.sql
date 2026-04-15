-- PostgreSQL Setup for BitWizard Insurance Fraud Detection System
-- Real-time AI training and analytics configuration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Create optimized indexes for real-time queries
CREATE INDEX IF NOT EXISTS idx_claims_fraud_score ON claims(fraud_score);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_claim_type ON claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON claims(submission_timestamp);
CREATE INDEX IF NOT EXISTS idx_customers_aadhaar ON customers(aadhaar);
CREATE INDEX IF NOT EXISTS idx_insurers_license ON insurers(license_number);

-- Create materialized views for AI training data
CREATE MATERIALIZED VIEW IF NOT EXISTS ml_training_data AS
SELECT 
    c.claim_id,
    c.customer_id,
    c.insurer_id,
    c.claim_type,
    c.total_amount,
    c.fraud_score,
    c.severity,
    c.status,
    c.submission_timestamp,
    c.risk_factors,
    c.ai_summary,
    cust.name as customer_name,
    cust.aadhaar,
    cust.city as customer_city,
    cust.state as customer_state,
    ins.company_name as insurer_name,
    ins.irda_registration,
    -- Feature engineering for ML
    EXTRACT(DAY FROM c.submission_timestamp) as claim_day,
    EXTRACT(MONTH FROM c.submission_timestamp) as claim_month,
    EXTRACT(YEAR FROM c.submission_timestamp) as claim_year,
    EXTRACT(HOUR FROM c.submission_timestamp) as claim_hour,
    -- Amount-based features
    CASE 
        WHEN c.total_amount < 50000 THEN 'low'
        WHEN c.total_amount < 200000 THEN 'medium'
        WHEN c.total_amount < 1000000 THEN 'high'
        ELSE 'very_high'
    END as amount_category,
    -- Risk score categorization
    CASE 
        WHEN c.fraud_score < 0.3 THEN 'low_risk'
        WHEN c.fraud_score < 0.7 THEN 'medium_risk'
        ELSE 'high_risk'
    END as risk_category,
    -- Time-based features
    CASE 
        WHEN EXTRACT(DAYOFWEEK FROM c.submission_timestamp) IN (0, 6) THEN true
        ELSE false
    END as is_weekend_claim,
    -- Document count feature
    CASE 
        WHEN c.documents IS NULL THEN 0
        ELSE array_length(string_to_array(c.documents, ','), 1)
    END as document_count
FROM claims c
LEFT JOIN customers cust ON c.customer_id = cust.id
LEFT JOIN insurers ins ON c.insurer_id = ins.id;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_ml_training_data_claim_id 
ON ml_training_data(claim_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_ml_training_data()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY ml_training_data;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic refresh
CREATE OR REPLACE FUNCTION auto_refresh_ml_data()
RETURNS trigger AS $$
BEGIN
    -- Schedule refresh in background (simplified approach)
    PERFORM pg_notify('ml_data_refresh', 'claims_updated');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on claims table
DROP TRIGGER IF EXISTS trigger_auto_refresh_ml ON claims;
CREATE TRIGGER trigger_auto_refresh_ml
    AFTER INSERT OR UPDATE OR DELETE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION auto_refresh_ml_data();

-- Create real-time analytics view
CREATE MATERIALIZED VIEW IF NOT EXISTS real_time_analytics AS
SELECT 
    claim_type,
    COUNT(*) as total_claims,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_claims,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_claims,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_claims,
    COUNT(*) FILTER (WHERE fraud_score > 0.7) as high_risk_claims,
    AVG(total_amount) as avg_claim_amount,
    MAX(total_amount) as max_claim_amount,
    MIN(total_amount) as min_claim_amount,
    AVG(fraud_score) as avg_fraud_score,
    MAX(fraud_score) as max_fraud_score,
    -- Real-time fraud rate
    ROUND(
        (COUNT(*) FILTER (WHERE fraud_score > 0.7) * 100.0) / 
        NULLIF(COUNT(*), 0), 2
    ) as fraud_percentage,
    -- Recent claims (last 24 hours)
    COUNT(*) FILTER (WHERE submission_timestamp > NOW() - INTERVAL '24 hours') as claims_last_24h,
    -- Recent claims (last 7 days)
    COUNT(*) FILTER (WHERE submission_timestamp > NOW() - INTERVAL '7 days') as claims_last_7d,
    -- Recent claims (last 30 days)
    COUNT(*) FILTER (WHERE submission_timestamp > NOW() - INTERVAL '30 days') as claims_last_30d
FROM claims
GROUP BY claim_type;

-- Create index for real-time analytics
CREATE INDEX IF NOT EXISTS idx_real_time_analytics_claim_type 
ON real_time_analytics(claim_type);

-- Create function to refresh real-time analytics
CREATE OR REPLACE FUNCTION refresh_real_time_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY real_time_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create AI model performance tracking table
CREATE TABLE IF NOT EXISTS ai_model_performance (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    training_data_count INTEGER NOT NULL,
    accuracy_score DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    auc_roc_score DECIMAL(5,4),
    training_time_seconds INTEGER,
    model_parameters JSONB,
    training_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for model performance
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_active 
ON ai_model_performance(is_active);

-- Create AI training jobs table
CREATE TABLE IF NOT EXISTS ai_training_jobs (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'incremental', 'full_retrain', 'feature_engineering'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    parameters JSONB,
    results JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for training jobs
CREATE INDEX IF NOT EXISTS idx_ai_training_jobs_status 
ON ai_training_jobs(status);

-- Create fraud pattern detection table
CREATE TABLE IF NOT EXISTS fraud_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'temporal', 'geographic', 'behavioral', 'network'
    pattern_description TEXT,
    detection_algorithm TEXT,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    detection_count INTEGER DEFAULT 0,
    last_detected TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to detect fraud patterns
CREATE OR REPLACE FUNCTION detect_fraud_patterns()
RETURNS TABLE(pattern_id INTEGER, pattern_name VARCHAR(100), detection_count INTEGER) AS $$
BEGIN
    -- This is a placeholder for actual pattern detection logic
    -- In production, this would analyze recent claims for patterns
    RETURN QUERY
    SELECT 
        fp.id,
        fp.pattern_name,
        COUNT(*) as detection_count
    FROM fraud_patterns fp
    WHERE fp.is_active = TRUE
    GROUP BY fp.id, fp.pattern_name;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for AI model retraining
CREATE OR REPLACE FUNCTION trigger_model_retraining()
RETURNS void AS $$
DECLARE
    job_count INTEGER;
BEGIN
    -- Check if there's already a running training job
    SELECT COUNT(*) INTO job_count
    FROM ai_training_jobs 
    WHERE status = 'running' AND job_type = 'full_retrain';
    
    -- Only start new training if no job is running
    IF job_count = 0 THEN
        INSERT INTO ai_training_jobs (job_name, job_type, status, start_time, parameters)
        VALUES (
            'Auto Retraining',
            'full_retrain',
            'pending',
            NOW(),
            '{"trigger": "automated", "data_freshness": "24h"}'::jsonb
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Set up automatic statistics collection
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Create notification channels for real-time updates
CREATE OR REPLACE FUNCTION claim_status_change_notification()
RETURNS trigger AS $$
BEGIN
    -- Send notification for real-time dashboard updates
    PERFORM pg_notify(
        'claim_status_change',
        json_build_object(
            'claim_id', NEW.claim_id,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'timestamp', NOW()
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change notifications
DROP TRIGGER IF EXISTS trigger_claim_status_notification ON claims;
CREATE TRIGGER trigger_claim_status_notification
    AFTER UPDATE OF status ON claims
    FOR EACH ROW
    EXECUTE FUNCTION claim_status_change_notification();

-- Create view for AI training data quality checks
CREATE MATERIALIZED VIEW IF NOT EXISTS data_quality_metrics AS
SELECT 
    'customers' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE name IS NOT NULL) as records_with_name,
    COUNT(*) FILTER (WHERE aadhaar IS NOT NULL) as records_with_aadhaar,
    COUNT(*) FILTER (WHERE email IS NOT NULL) as records_with_email,
    COUNT(*) FILTER (WHERE phone IS NOT NULL) as records_with_phone,
    ROUND(
        (COUNT(*) FILTER (WHERE name IS NOT NULL) * 100.0) / 
        NULLIF(COUNT(*), 0), 2
    ) as name_completeness_pct,
    ROUND(
        (COUNT(*) FILTER (WHERE aadhaar IS NOT NULL) * 100.0) / 
        NULLIF(COUNT(*), 0), 2
    ) as aadhaar_completeness_pct
FROM customers

UNION ALL

SELECT 
    'claims' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE claim_id IS NOT NULL) as records_with_claim_id,
    COUNT(*) FILTER (WHERE fraud_score IS NOT NULL) as records_with_fraud_score,
    COUNT(*) FILTER (WHERE total_amount > 0) as records_with_valid_amount,
    COUNT(*) FILTER (WHERE status IN ('approved', 'rejected', 'pending')) as records_with_valid_status,
    ROUND(
        (COUNT(*) FILTER (WHERE fraud_score IS NOT NULL) * 100.0) / 
        NULLIF(COUNT(*), 0), 2
    ) as fraud_score_completeness_pct,
    ROUND(
        (COUNT(*) FILTER (WHERE total_amount > 0) * 100.0) / 
        NULLIF(COUNT(*), 0), 2
    ) as amount_completeness_pct
FROM claims;

-- Create index for data quality metrics
CREATE INDEX IF NOT EXISTS idx_data_quality_table_name 
ON data_quality_metrics(table_name);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;

-- Refresh materialized views
SELECT refresh_ml_training_data();
SELECT refresh_real_time_analytics();

COMMIT;
