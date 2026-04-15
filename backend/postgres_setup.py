import psycopg2
from psycopg2 import sql
from datetime import datetime, timedelta
import random
import os

# Indian names database
first_names = [
    "Rahul", "Priya", "Amit", "Anjali", "Vikram", "Sunita", "Rajesh", "Meena",
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

def create_postgres_database():
    """Create PostgreSQL database with Indian context data"""
    
    # Database connection parameters
    db_params = {
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'port': os.getenv('POSTGRES_PORT', '5432'),
        'database': os.getenv('POSTGRES_DB', 'bitwizard_insurance'),
        'user': os.getenv('POSTGRES_USER', 'smit'),
        'password': os.getenv('POSTGRES_PASSWORD', '')
    }
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        print("Connected to PostgreSQL database successfully!")
        
        # Create tables
        print("Creating tables...")
        
        # Customers table
        cursor.execute('''
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
            )
        ''')
        
        # Insurers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS insurers (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(100) NOT NULL,
                license_number VARCHAR(20) UNIQUE,
                contact_person VARCHAR(100),
                phone VARCHAR(20),
                email VARCHAR(100) UNIQUE,
                website VARCHAR(100),
                irda_registration VARCHAR(20),
                gst_number VARCHAR(15),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Claims table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS claims (
                id SERIAL PRIMARY KEY,
                claim_id VARCHAR(20) UNIQUE NOT NULL,
                customer_id INTEGER REFERENCES customers(id),
                insurer_id INTEGER REFERENCES insurers(id),
                claim_type VARCHAR(20) NOT NULL,
                amount_inr DECIMAL(12,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                fraud_score DECIMAL(3,2),
                severity VARCHAR(10),
                description TEXT,
                documents TEXT[],
                ai_summary TEXT,
                risk_factors TEXT[],
                submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_date TIMESTAMP,
                reviewed_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Claim_documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS claim_documents (
                id SERIAL PRIMARY KEY,
                claim_id INTEGER REFERENCES claims(id),
                document_name VARCHAR(100) NOT NULL,
                document_type VARCHAR(50),
                file_path VARCHAR(255),
                file_size INTEGER,
                mime_type VARCHAR(50),
                ocr_extracted_text TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Video_calls table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS video_calls (
                id SERIAL PRIMARY KEY,
                claim_id INTEGER REFERENCES claims(id),
                customer_id INTEGER REFERENCES customers(id),
                insurer_id INTEGER REFERENCES insurers(id),
                meeting_id VARCHAR(50) UNIQUE,
                zoom_meeting_id VARCHAR(50),
                meeting_url VARCHAR(255),
                scheduled_time TIMESTAMP,
                duration_minutes INTEGER,
                status VARCHAR(20) DEFAULT 'scheduled',
                recording_url VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Audit_logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                user_type VARCHAR(20),
                action VARCHAR(50) NOT NULL,
                table_name VARCHAR(50),
                record_id INTEGER,
                old_values JSONB,
                new_values JSONB,
                ip_address INET,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_customers_aadhaar ON customers(aadhaar)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_claims_customer_id ON claims(customer_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_claims_insurer_id ON claims(insurer_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_claims_fraud_score ON claims(fraud_score)')
        
        print("Tables created successfully!")
        
        # Insert sample data
        print("Inserting sample data...")
        
        # Insert sample insurers
        for company in insurance_companies:
            cursor.execute('''
                INSERT INTO insurers (company_name, license_number, contact_person, phone, email, 
                                    website, irda_registration, gst_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
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
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (aadhaar) DO NOTHING
            ''', (
                aadhaar,
                pan,
                name,
                phone,
                f"{name.lower().replace(' ', '.')}@gmail.com",
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
        print("Creating analytics views...")
        
        cursor.execute('''
            CREATE OR REPLACE VIEW claim_analytics AS
            SELECT 
                claim_type,
                COUNT(*) as total_claims,
                COUNT(*) FILTER (WHERE status = 'approved') as approved_claims,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected_claims,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_claims,
                AVG(amount_inr) as avg_claim_amount,
                AVG(fraud_score) as avg_fraud_score,
                COUNT(*) FILTER (WHERE fraud_score > 0.7) as high_risk_claims
            FROM claims
            GROUP BY claim_type
        ''')
        
        cursor.execute('''
            CREATE OR REPLACE VIEW insurer_performance AS
            SELECT 
                i.company_name,
                COUNT(c.id) as total_claims,
                COUNT(c.id) FILTER (WHERE c.status = 'approved') as approved_claims,
                COUNT(c.id) FILTER (WHERE c.status = 'rejected') as rejected_claims,
                AVG(c.amount_inr) as avg_claim_amount,
                AVG(c.fraud_score) as avg_fraud_score,
                COUNT(c.id) FILTER (WHERE c.fraud_score > 0.7) as high_risk_claims
            FROM insurers i
            LEFT JOIN claims c ON i.id = c.insurer_id
            GROUP BY i.company_name, i.id
        ''')
        
        conn.commit()
        print("Analytics views created successfully!")
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM customers")
        customer_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM insurers")
        insurer_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM claims")
        claim_count = cursor.fetchone()[0]
        
        print(f"\nDatabase setup completed successfully!")
        print(f"Customers: {customer_count}")
        print(f"Insurers: {insurer_count}")
        print(f"Claims: {claim_count}")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    create_postgres_database()
