#!/usr/bin/env python3
"""
Setup Indian context database with SQLite (fallback) and PostgreSQL support
"""

import sqlite3
from datetime import datetime, timedelta
import random
import os

# Indian names database
first_names = [
    "Sara", "Priya", "Amit", "Anjali", "Vikram", "Sunita", "Rajesh", "Meena",
    "Sanjay", "Pooja", "Arun", "Kavita", "Deepak", "Neha", "Manoj", "Swati",
    "Vijay", "Rashmi", "Anand", "Divya", "Rohit", "Shweta", "Ajay", "Rekha",
    "Suresh", "Madhuri", "Vinod", "Kiran", "Mahesh", "Anita", "Ramesh", "Lata"
]

middle_names = [
    "Kumar", "Kumari", "Singh", "Devi", "Lal", "Bai", "Prasad", "Devi",
    "Chandra", "Prakash", "Rani", "Mohan", "Devi", "Kumar", "Prasad", "Bai"
]

last_names = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Jain", "Agarwal", "Shah",
    "Mishra", "Reddy", "Nair", "Iyer", "Menon", "Pillai", "Rao", "Chatterjee",
    "Mukherjee", "Banerjee", "Ghosh", "Chakraborty", "Das", "Sen", "Bose"
]

# Indian cities
cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
    "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Cochin", "Indore", "Bhopal",
    "Chandigarh", "Nagpur", "Visakhapatnam", "Coimbatore", "Kochi", "Thiruvananthapuram"
]

# Indian insurance companies
insurance_companies = [
    "Life Insurance Corporation", "ICICI Prudential", "HDFC Life", "SBI Life",
    "Bajaj Allianz", "Tata AIG", "Reliance General", "New India Assurance",
    "United India Insurance", "National Insurance", "Oriental Insurance",
    "IFFCO Tokio", "Cholamandalam MS", "Royal Sundaram", "Bharti AXA"
]

def generate_indian_name():
    """Generate Indian name in First Middle Last format"""
    first = random.choice(first_names)
    middle = random.choice(middle_names)
    last = random.choice(last_names)
    return f"{first} {middle} {last}"

def generate_aadhaar():
    """Generate Indian Aadhaar number"""
    return f"{random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"

def generate_pan():
    """Generate Indian PAN number"""
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return f"{random.choice(letters)}{random.choice(letters)}P{random.choice(letters)}{random.randint(1000, 9999)}{random.choice(letters)}"

def generate_indian_amount(min_amount, max_amount):
    """Generate amount in INR"""
    return random.randint(min_amount, max_amount)

def generate_indian_phone():
    """Generate Indian phone number"""
    return f"+91-{random.randint(6000000000, 9999999999)}"

def create_sqlite_database():
    """Create SQLite database with Indian context data"""
    conn = sqlite3.connect('fraud_detection_indian.db')
    cursor = conn.cursor()
    
    print("Creating SQLite database with Indian context...")
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY,
            aadhaar TEXT UNIQUE,
            pan TEXT UNIQUE,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT UNIQUE,
            address TEXT,
            city TEXT,
            state TEXT,
            pincode TEXT,
            digilocker_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS insurers (
            id INTEGER PRIMARY KEY,
            company_name TEXT NOT NULL,
            license_number TEXT UNIQUE NOT NULL,
            contact_person TEXT,
            phone TEXT,
            email TEXT UNIQUE,
            website TEXT,
            irda_registration TEXT,
            gst_number TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS claims (
            id INTEGER PRIMARY KEY,
            claim_id TEXT UNIQUE NOT NULL,
            customer_id INTEGER,
            insurer_id INTEGER,
            claim_type TEXT NOT NULL,
            patient_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            diagnosis_code TEXT,
            diagnosis_description TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            severity TEXT DEFAULT 'low',
            fraud_score REAL,
            shap_explanation TEXT,
            source TEXT NOT NULL,
            hospital_id TEXT,
            attending_doctor_id TEXT,
            policyholder_id TEXT NOT NULL,
            cluster_id TEXT,
            is_fraud_ring BOOLEAN DEFAULT FALSE,
            xgboost_score REAL,
            louvain_score REAL,
            requires_human_review BOOLEAN DEFAULT FALSE,
            recommendation TEXT,
            google_play_integrity_token TEXT,
            digilocker_verification_hash TEXT,
            mediapipe_liveness_passed BOOLEAN,
            itemized_billing TEXT,
            service_date TIMESTAMP,
            submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            documents TEXT,
            ai_summary TEXT,
            risk_factors TEXT,
            processed_date TIMESTAMP,
            reviewed_by TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers (id),
            FOREIGN KEY (insurer_id) REFERENCES insurers (id)
        )
    ''')
    
    # Insert sample insurers
    for company in insurance_companies:
        cursor.execute('''
            INSERT INTO insurers (company_name, license_number, contact_person, phone, email, 
                                website, irda_registration, gst_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (license_number) DO NOTHING
        ''', (
            company,
            f"IRDA-{random.randint(100000, 999999)}",
            generate_indian_name(),
            generate_indian_phone(),
            f"contact@{company.lower().replace(' ', '').replace(',', '')}.com",
            f"https://www.{company.lower().replace(' ', '').replace(',', '')}.com",
            f"IRDA/{random.randint(100, 999)}/{random.randint(2020, 2024)}",
            f"{random.randint(10, 99)}AAAPL{random.randint(1000, 9999)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"
        ))
    
    # Insert sample customers
    for i in range(50):
        name = generate_indian_name()
        aadhaar = generate_aadhaar()
        pan = generate_pan()
        phone = generate_indian_phone()
        city = random.choice(cities)
        
        cursor.execute('''
            INSERT INTO customers (aadhaar, pan, name, phone, email, address, city, state, pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (aadhaar) DO NOTHING
        ''', (
            aadhaar,
            pan,
            name,
            phone,
            f"{name.lower().replace(' ', '.').replace(',', '')}{i}@gmail.com",
            f"Plot {random.randint(1, 999)}, {random.choice(['Sector', 'Block', 'Area'])} {random.randint(1, 50)}",
            city,
            random.choice(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat']),
            f"{random.randint(110001, 844001)}"
        ))
    
    # Insert sample claims
    claim_types = ['health', 'auto', 'life', 'corporate']
    for i in range(200):
        claim_type = random.choice(claim_types)
        customer_id = random.randint(1, 50)
        insurer_id = random.randint(1, len(insurance_companies))
        
        # Indian context amounts
        amount_ranges = {
            'health': (50000, 150000),
            'auto': (75000, 200000),
            'life': (1000000, 5000000),
            'corporate': (200000, 1000000)
        }
        
        min_amount, max_amount = amount_ranges[claim_type]
        amount = generate_indian_amount(min_amount, max_amount)
        
        fraud_score = random.uniform(0.1, 0.95)
        severity = 'high' if fraud_score > 0.7 else 'medium' if fraud_score > 0.4 else 'low'
        
        # Indian context risk factors
        risk_factors = []
        if claim_type == 'health':
            risk_factors = random.sample([
                'Billing for services not rendered', 'Upcoding and phantom billing',
                'Excessive medical procedures', 'Duplicate claims for same treatment',
                'Fake hospital bills', 'Staged accidents'
            ], random.randint(1, 3))
        elif claim_type == 'auto':
            risk_factors = random.sample([
                'Staged accidents', 'Inflated repair costs', 'Phantom damage claims',
                'Odometer rollback', 'Fake repair bills', 'Multiple claims for same accident'
            ], random.randint(1, 3))
        elif claim_type == 'life':
            risk_factors = random.sample([
                'Concealed medical conditions', 'Suicide misrepresentation',
                'Staged accidents', 'False beneficiary claims', 'Fake death certificates'
            ], random.randint(1, 3))
        else:
            risk_factors = random.sample([
                'Business interruption fraud', 'Property value inflation',
                'Phantom vendor schemes', 'Employee collusion', 'Fake invoices'
            ], random.randint(1, 3))
        
        cursor.execute('''
            INSERT INTO claims (claim_id, customer_id, insurer_id, claim_type, patient_name, 
                             total_amount, status, fraud_score, severity, source, policyholder_id, documents, ai_summary, risk_factors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (claim_id) DO NOTHING
        ''', (
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
            f"AI analysis indicates {severity} risk with {len(risk_factors)} risk factors detected",
            ','.join(risk_factors)
        ))
    
    conn.commit()
    conn.close()
    print("Indian context SQLite database created successfully!")

def create_postgres_instructions():
    """Create instructions for PostgreSQL setup"""
    instructions = """
# PostgreSQL Setup Instructions for BitWizard Insurance System

## 1. Install PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database user
sudo -u postgres createuser --interactive
# Follow prompts to create 'postgres' user with password

# Create database
sudo -u postgres createdb bitwizard_insurance
```

## 2. Install Python Dependencies
```bash
pip install psycopg2-binary sqlalchemy
```

## 3. Set Environment Variables
```bash
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=bitwizard_insurance
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
```

## 4. Run Database Setup
```bash
cd backend
python3 postgres_setup.py
```

## 5. Update Database Configuration
The database configuration is already set in `backend/app/core/database.py`:
- Uses PostgreSQL by default
- Falls back to SQLite if PostgreSQL is not available
- Supports environment variables for configuration

## 6. Verify Database Connection
```bash
cd backend
python3 -c "from app.core.database import init_db; init_db(); print('Database connected successfully!')"
```

## Database Schema
The system includes the following tables:
- `customers`: Indian customer profiles with Aadhaar verification
- `insurers`: Insurance company details with IRDA registration
- `claims`: Insurance claims with AI fraud detection
- `fraud_rings`: Fraud ring detection data
- `audit_logs`: Complete audit trail

## Indian Context Features
- All amounts in INR (Rupees)
- Indian names (First Middle Last format)
- Aadhaar-based authentication
- IRDA compliance
- GST registration for businesses
- Indian cities and states
- Local phone number formats
"""
    
    with open('POSTGRES_SETUP.md', 'w') as f:
        f.write(instructions)
    
    print("PostgreSQL setup instructions saved to POSTGRES_SETUP.md")

def main():
    """Main function"""
    print("BitWizard Insurance System - Indian Database Setup")
    print("=" * 60)
    
    # Create SQLite database with Indian context
    create_sqlite_database()
    
    # Create PostgreSQL setup instructions
    create_postgres_instructions()
    
    print("\nSetup completed!")
    print("1. SQLite database created with Indian context data")
    print("2. PostgreSQL setup instructions saved to POSTGRES_SETUP.md")
    print("3. All mock data updated to Indian context")
    print("4. Currency changed from USD to INR (Rupees)")
    print("5. Names updated to Indian format (First Middle Last)")
    
    print("\nTo start the application:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Start backend: cd backend && python -m uvicorn app.main:app --reload")
    print("3. Start frontend: cd src && npm run dev")
    print("4. Access at: http://localhost:3000")

if __name__ == "__main__":
    main()
