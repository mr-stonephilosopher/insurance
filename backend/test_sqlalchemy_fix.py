#!/usr/bin/env python3
"""
Test SQLAlchemy connection with proper text() declaration
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# SQLAlchemy connection
SQLALCHEMY_DATABASE_URL = "postgresql://smit@localhost:5432/bitwizard_insurance"

def test_sqlalchemy_connection():
    """Test SQLAlchemy connection with proper text()"""
    try:
        print("=== Testing SQLAlchemy Connection (Fixed) ===")
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Test query with text()
        result = db.execute(text("SELECT COUNT(*) FROM customers"))
        customer_count = result.scalar()
        
        result = db.execute(text("SELECT COUNT(*) FROM insurers"))
        insurer_count = result.scalar()
        
        result = db.execute(text("SELECT COUNT(*) FROM claims"))
        claim_count = result.scalar()
        
        print(f"Customers: {customer_count}")
        print(f"Insurers: {insurer_count}")
        print(f"Claims: {claim_count}")
        
        # Test complex query with text()
        result = db.execute(text("""
            SELECT claim_type, COUNT(*) as count, AVG(fraud_score) as avg_fraud
            FROM claims
            GROUP BY claim_type
            ORDER BY avg_fraud DESC
        """))
        
        print(f"\nClaims by type:")
        for row in result:
            print(f"  {row.claim_type}: {row.count} claims, avg fraud: {row.avg_fraud:.3f}")
        
        db.close()
        print("SQLAlchemy connection test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"SQLAlchemy connection test: FAILED - {e}")
        return False

if __name__ == "__main__":
    test_sqlalchemy_connection()
