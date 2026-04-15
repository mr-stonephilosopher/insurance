#!/usr/bin/env python3
"""
Final database population with Indian context data
"""

import psycopg2
import os
import random
from datetime import datetime, timedelta

# Database connection parameters
db_params = {
    'host': 'localhost',
    'port': '5432',
    'database': 'bitwizard_insurance',
    'user': 'smit',
    'password': ''
}

# Indian data
first_names = ["Sara", "Priya", "Amit", "Anjali", "Vikram", "Sunita", "Rajesh", "Meena", "Sanjay", "Pooja"]
last_names = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Jain", "Agarwal", "Shah"]
cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
insurance_companies = ["LIC of India", "ICICI Prudential", "HDFC Life", "SBI Life", "Bajaj Allianz"]

def generate_indian_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def generate_aadhaar():
    return f"{random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"

def generate_indian_phone():
    return f"+91-{random.randint(6000000000, 9999999999)}"

def populate_database():
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        print("=== BitWizard Insurance Database Setup ===")
        print("Populating database with Indian context data...")
        
        # Clear existing data
        cursor.execute("DELETE FROM claims")
        cursor.execute("DELETE FROM customers") 
        cursor.execute("DELETE FROM insurers")
        conn.commit()
        
        # Insert insurers
        insurer_ids = []
        for i, company in enumerate(insurance_companies, 1):
            cursor.execute('''
                INSERT INTO insurers (company_name, license_number, contact_person, phone, email, website, irda_registration)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                company,
                f"IRDA-{random.randint(100000, 999999)}",
                generate_indian_name(),
                generate_indian_phone(),
                f"contact@{company.lower().replace(' ', '').replace(',', '')}.com",
                f"https://www.{company.lower().replace(' ', '').replace(',', '')}.com",
                f"IRDA/{random.randint(100, 999)}/{random.randint(2020, 2024)}"
            ))
            insurer_id = cursor.fetchone()[0]
            insurer_ids.append(insurer_id)
            print(f"Inserted insurer {i}: {company} (ID: {insurer_id})")
        
        conn.commit()
        
        # Insert customers
        customer_ids = []
        for i in range(20):
            name = generate_indian_name()
            aadhaar = generate_aadhaar()
            phone = generate_indian_phone()
            city = random.choice(cities)
            
            cursor.execute('''
                INSERT INTO customers (aadhaar, name, phone, email, city, state)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                aadhaar,
                name,
                phone,
                f"{name.lower().replace(' ', '.').replace(',', '')}{i}@gmail.com",
                city,
                random.choice(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'])
            ))
            customer_id = cursor.fetchone()[0]
            customer_ids.append(customer_id)
            print(f"Inserted customer {i+1}: {name} (ID: {customer_id})")
        
        conn.commit()
        
        # Insert claims with proper data types
        claim_types = ['health', 'auto', 'life', 'corporate']
        for i in range(50):
            claim_type = random.choice(claim_types)
            customer_id = random.choice(customer_ids)
            insurer_id = random.choice(insurer_ids)
            
            # Indian context amounts
            amount_ranges = {
                'health': (50000, 150000),
                'auto': (75000, 200000),
                'life': (1000000, 5000000),
                'corporate': (200000, 1000000)
            }
            
            min_amount, max_amount = amount_ranges[claim_type]
            amount = random.randint(min_amount, max_amount)
            fraud_score = round(random.uniform(0.1, 0.95), 2)
            severity = 'high' if fraud_score > 0.7 else 'medium' if fraud_score > 0.4 else 'low'
            
            # Prepare claim data
            claim_data = (
                f"{claim_type.upper()}-{random.randint(10000, 99999)}",
                customer_id,
                insurer_id,
                claim_type,
                generate_indian_name(),
                amount,
                random.choice(['pending', 'approved', 'rejected', 'under_review']),
                fraud_score,
                severity,
                random.choice(['B2B', 'CONSUMER']),
                f"POL-{random.randint(100000, 999999)}",
                f"document_{i+1}.pdf,document_{i+2}.pdf",
                f"AI analysis indicates {severity} risk with fraud score {fraud_score}",
                f"Risk factors detected for {claim_type} claim"
            )
            
            cursor.execute('''
                INSERT INTO claims (claim_id, customer_id, insurer_id, claim_type, patient_name, total_amount, 
                                 status, fraud_score, severity, source, policyholder_id, documents, ai_summary, risk_factors)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', claim_data)
            
            print(f"Inserted claim {i+1}: {claim_data[0]} (Amount: Rs.{amount:,}, Risk: {severity})")
        
        conn.commit()
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM customers")
        customer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM insurers")
        insurer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM claims")
        claim_count = cursor.fetchone()[0]
        
        print(f"\n=== Database Population Complete ===")
        print(f"Customers: {customer_count}")
        print(f"Insurers: {insurer_count}")
        print(f"Claims: {claim_count}")
        
        # Setup AI training features
        print(f"\n=== Setting up Real-time AI Training ===")
        
        # Create performance indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_claims_fraud_score ON claims(fraud_score)",
            "CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status)",
            "CREATE INDEX IF NOT EXISTS idx_claims_claim_type ON claims(claim_type)",
            "CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON claims(submission_timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_customers_aadhaar ON customers(aadhaar)",
            "CREATE INDEX IF NOT EXISTS idx_insurers_license ON insurers(license_number)"
        ]
        
        for index_sql in indexes:
            cursor.execute(index_sql)
        
        conn.commit()
        print("Performance indexes created successfully!")
        
        # Create materialized view for ML training
        cursor.execute('''
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
                cust.name as customer_name,
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
                    WHEN EXTRACT(ISODOW FROM c.submission_timestamp) IN (6, 7) THEN true
                    ELSE false
                END as is_weekend_claim
            FROM claims c
            LEFT JOIN customers cust ON c.customer_id = cust.id
            LEFT JOIN insurers ins ON c.insurer_id = ins.id
        ''')
        
        # Create unique index on materialized view
        cursor.execute('''
            CREATE UNIQUE INDEX IF NOT EXISTS idx_ml_training_data_claim_id 
            ON ml_training_data(claim_id)
        ''')
        
        conn.commit()
        print("ML training materialized view created successfully!")
        
        # Create real-time analytics view
        cursor.execute('''
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
            GROUP BY claim_type
        ''')
        
        conn.commit()
        print("Real-time analytics view created successfully!")
        
        # Create AI model performance tracking table
        cursor.execute('''
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
            )
        ''')
        
        conn.commit()
        print("AI model performance tracking table created!")
        
        # Test database connection
        cursor.execute("SELECT claim_type, COUNT(*) as count, AVG(fraud_score) as avg_fraud FROM claims GROUP BY claim_type")
        results = cursor.fetchall()
        
        print(f"\n=== Database Verification ===")
        print("Claims by type with average fraud scores:")
        for row in results:
            print(f"  {row[0].title()}: {row[1]} claims, Avg fraud score: {row[2]:.3f}")
        
        print(f"\n=== PostgreSQL Setup Complete ===")
        print("Database is ready for real-time AI training!")
        print("Connection: postgresql://smit@localhost:5432/bitwizard_insurance")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    populate_database()
