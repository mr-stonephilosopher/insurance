#!/usr/bin/env python3
"""
Test PostgreSQL connection and AI integration
"""

import psycopg2
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database connection parameters
db_params = {
    'host': 'localhost',
    'port': '5432',
    'database': 'bitwizard_insurance',
    'user': 'smit',
    'password': ''
}

# SQLAlchemy connection
SQLALCHEMY_DATABASE_URL = "postgresql://smit@localhost:5432/bitwizard_insurance"

def test_postgres_connection():
    """Test basic PostgreSQL connection"""
    try:
        print("=== Testing PostgreSQL Connection ===")
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"PostgreSQL Version: {version}")
        
        # Test database tables
        cursor.execute("""
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"\nTables in database: {len(tables)}")
        for table in tables:
            print(f"  {table[0]} ({table[1]})")
        
        conn.close()
        print("PostgreSQL connection test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"PostgreSQL connection test: FAILED - {e}")
        return False

def test_sqlalchemy_connection():
    """Test SQLAlchemy connection"""
    try:
        print("\n=== Testing SQLAlchemy Connection ===")
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Test query
        result = db.execute("SELECT COUNT(*) FROM customers")
        customer_count = result.scalar()
        
        result = db.execute("SELECT COUNT(*) FROM insurers")
        insurer_count = result.scalar()
        
        result = db.execute("SELECT COUNT(*) FROM claims")
        claim_count = result.scalar()
        
        print(f"Customers: {customer_count}")
        print(f"Insurers: {insurer_count}")
        print(f"Claims: {claim_count}")
        
        db.close()
        print("SQLAlchemy connection test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"SQLAlchemy connection test: FAILED - {e}")
        return False

def test_ai_training_data():
    """Test AI training data availability"""
    try:
        print("\n=== Testing AI Training Data ===")
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Test materialized view
        cursor.execute("SELECT COUNT(*) FROM ml_training_data")
        ml_data_count = cursor.fetchone()[0]
        print(f"ML training data records: {ml_data_count}")
        
        # Test real-time analytics
        cursor.execute("SELECT COUNT(*) FROM real_time_analytics")
        analytics_count = cursor.fetchone()[0]
        print(f"Real-time analytics records: {analytics_count}")
        
        # Test fraud score distribution
        cursor.execute("""
            SELECT 
                claim_type,
                COUNT(*) as total_claims,
                AVG(fraud_score) as avg_fraud_score,
                MAX(fraud_score) as max_fraud_score,
                MIN(fraud_score) as min_fraud_score
            FROM claims
            GROUP BY claim_type
            ORDER BY avg_fraud_score DESC
        """)
        fraud_analysis = cursor.fetchall()
        
        print(f"\nFraud Analysis by Claim Type:")
        for row in fraud_analysis:
            print(f"  {row[0].title()}: {row[1]} claims, "
                  f"Avg fraud: {row[2]:.3f}, "
                  f"Range: {row[3]:.3f}-{row[4]:.3f}")
        
        # Test Indian context data
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE city LIKE '%Mumbai%' OR city LIKE '%Delhi%' OR city LIKE '%Bangalore%') as metro_customers,
                COUNT(*) FILTER (WHERE aadhaar IS NOT NULL) as aadhaar_verified,
                COUNT(DISTINCT city) as unique_cities
            FROM customers
        """)
        indian_context = cursor.fetchone()
        
        print(f"\nIndian Context Data:")
        print(f"  Metro customers: {indian_context[0]}")
        print(f"  Aadhaar verified: {indian_context[1]}")
        print(f"  Unique cities: {indian_context[2]}")
        
        # Test amount ranges in INR
        cursor.execute("""
            SELECT 
                claim_type,
                MIN(total_amount) as min_amount,
                MAX(total_amount) as max_amount,
                AVG(total_amount) as avg_amount
            FROM claims
            GROUP BY claim_type
            ORDER BY claim_type
        """)
        amount_ranges = cursor.fetchall()
        
        print(f"\nAmount Ranges (INR):")
        for row in amount_ranges:
            print(f"  {row[0].title()}: Rs.{row[1]:,} - Rs.{row[2]:,} "
                  f"(Avg: Rs.{row[3]:,})")
        
        conn.close()
        print("AI training data test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"AI training data test: FAILED - {e}")
        return False

def test_real_time_features():
    """Test real-time features"""
    try:
        print("\n=== Testing Real-time Features ===")
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Test performance indexes
        cursor.execute("""
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%'
            ORDER BY indexname
        """)
        indexes = cursor.fetchall()
        print(f"Performance indexes: {len(indexes)}")
        for idx in indexes:
            print(f"  {idx[0]} on {idx[1]}")
        
        # Test AI model performance table
        cursor.execute("SELECT COUNT(*) FROM ai_model_performance")
        model_count = cursor.fetchone()[0]
        print(f"AI model performance records: {model_count}")
        
        # Test recent claims (last 24 hours)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM claims 
            WHERE submission_timestamp > NOW() - INTERVAL '24 hours'
        """)
        recent_claims = cursor.fetchone()[0]
        print(f"Recent claims (24h): {recent_claims}")
        
        # Test fraud detection readiness
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE fraud_score > 0.7) as high_risk,
                COUNT(*) FILTER (WHERE fraud_score BETWEEN 0.3 AND 0.7) as medium_risk,
                COUNT(*) FILTER (WHERE fraud_score < 0.3) as low_risk
            FROM claims
        """)
        risk_distribution = cursor.fetchone()
        
        print(f"\nRisk Distribution:")
        print(f"  High risk (>0.7): {risk_distribution[0]}")
        print(f"  Medium risk (0.3-0.7): {risk_distribution[1]}")
        print(f"  Low risk (<0.3): {risk_distribution[2]}")
        
        conn.close()
        print("Real-time features test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"Real-time features test: FAILED - {e}")
        return False

def main():
    """Run all tests"""
    print("BitWizard Insurance - PostgreSQL & AI Integration Test")
    print("=" * 60)
    
    tests = [
        ("PostgreSQL Connection", test_postgres_connection),
        ("SQLAlchemy Connection", test_sqlalchemy_connection),
        ("AI Training Data", test_ai_training_data),
        ("Real-time Features", test_real_time_features)
    ]
    
    results = {}
    for test_name, test_func in tests:
        results[test_name] = test_func()
    
    print(f"\n=== Test Summary ===")
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        print(f"\nAll tests passed! PostgreSQL is ready for AI training.")
        print(f"Connection string: postgresql://smit@localhost:5432/bitwizard_insurance")
    else:
        print(f"\nSome tests failed. Please check the configuration.")
    
    return all_passed

if __name__ == "__main__":
    main()
