import sqlite3
from datetime import datetime, timedelta
import random

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

# Indian hospitals
hospitals = [
    "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Narayana Health",
    "Manipal Hospitals", "Medanta", "Columbia Asia", "Lilavati Hospital",
    "Kokilaben Dhirubhai Ambani Hospital", "Tata Memorial Hospital", "AIIMS",
    "PGIMER", "Christian Medical College", "Sir Ganga Ram Hospital", "BLK Hospital"
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

# Indian insurance statistics
insurance_stats = {
    "health": {
        "average_claim": 85000,  # INR
        "fraud_detection_rate": 15.2,
        "processing_time": "< 2 seconds",
        "common_fraud_indicators": [
            "Billing for services not rendered",
            "Upcoding and phantom billing",
            "Excessive medical procedures",
            "Duplicate claims for same treatment",
            "Fake hospital bills",
            "Staged accidents"
        ]
    },
    "auto": {
        "average_claim": 125000,  # INR
        "fraud_detection_rate": 22.7,
        "processing_time": "< 2 seconds",
        "common_fraud_indicators": [
            "Staged accidents",
            "Inflated repair costs",
            "Phantom damage claims",
            "Odometer rollback",
            "Fake repair bills",
            "Multiple claims for same accident"
        ]
    },
    "life": {
        "average_claim": 2500000,  # INR
        "fraud_detection_rate": 8.9,
        "processing_time": "< 2 seconds",
        "common_fraud_indicators": [
            "Concealed medical conditions",
            "Suicide misrepresentation",
            "Staged accidents",
            "False beneficiary claims",
            "Fake death certificates",
            "Policy fraud"
        ]
    },
    "corporate": {
        "average_claim": 450000,  # INR
        "fraud_detection_rate": 24.1,
        "processing_time": "< 2 seconds",
        "common_fraud_indicators": [
            "Business interruption fraud",
            "Property value inflation",
            "Phantom vendor schemes",
            "Employee collusion",
            "Fake invoices",
            "Inventory manipulation"
        ]
    }
}

def create_indian_database():
    """Create Indian context database"""
    conn = sqlite3.connect('fraud_detection.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY,
            aadhaar TEXT UNIQUE,
            pan TEXT UNIQUE,
            name TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            created_at TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS insurers (
            id INTEGER PRIMARY KEY,
            company_name TEXT,
            license_number TEXT,
            contact_person TEXT,
            phone TEXT,
            email TEXT,
            created_at TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS claims (
            id INTEGER PRIMARY KEY,
            claim_id TEXT UNIQUE,
            customer_id INTEGER,
            insurer_id INTEGER,
            claim_type TEXT,
            amount_inr REAL,
            status TEXT,
            fraud_score REAL,
            severity TEXT,
            description TEXT,
            documents TEXT,
            created_at TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers (id),
            FOREIGN KEY (insurer_id) REFERENCES insurers (id)
        )
    ''')
    
    # Insert sample customers
    for i in range(50):
        name = generate_indian_name()
        aadhaar = generate_aadhaar()
        pan = generate_pan()
        phone = generate_indian_phone()
        city = random.choice(cities)
        
        cursor.execute('''
            INSERT INTO customers (aadhaar, pan, name, phone, email, address, city, state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            aadhaar,
            pan,
            name,
            phone,
            f"{name.lower().replace(' ', '.')}@gmail.com",
            f"Plot {random.randint(1, 999)}, {random.choice(['Sector', 'Block', 'Area'])} {random.randint(1, 50)}",
            city,
            random.choice(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat']),
            datetime.now() - timedelta(days=random.randint(1, 365))
        ))
    
    # Insert sample insurers
    for company in insurance_companies:
        cursor.execute('''
            INSERT INTO insurers (company_name, license_number, contact_person, phone, email, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            company,
            f"IRDA-{random.randint(100000, 999999)}",
            generate_indian_name(),
            generate_indian_phone(),
            f"contact@{company.lower().replace(' ', '').replace(',', '')}.com",
            datetime.now() - timedelta(days=random.randint(1, 365))
        ))
    
    # Insert sample claims
    claim_types = ['health', 'auto', 'life', 'corporate']
    for i in range(200):
        claim_type = random.choice(claim_types)
        customer_id = random.randint(1, 50)
        insurer_id = random.randint(1, len(insurance_companies))
        
        stats = insurance_stats[claim_type]
        amount = generate_indian_amount(
            int(stats['average_claim'] * 0.5),
            int(stats['average_claim'] * 2.0)
        )
        
        fraud_score = random.uniform(0.1, 0.95)
        severity = 'high' if fraud_score > 0.7 else 'medium' if fraud_score > 0.4 else 'low'
        
        cursor.execute('''
            INSERT INTO claims (claim_id, customer_id, insurer_id, claim_type, amount_inr, 
                             status, fraud_score, severity, description, documents, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            f"{claim_type.upper()}-{random.randint(10000, 99999)}",
            customer_id,
            insurer_id,
            claim_type,
            amount,
            random.choice(['pending', 'approved', 'rejected', 'under_review']),
            fraud_score,
            severity,
            f"Sample {claim_type} insurance claim for {name}",
            f"document_{i+1}.pdf,document_{i+2}.pdf",
            datetime.now() - timedelta(days=random.randint(1, 30))
        ))
    
    conn.commit()
    conn.close()
    print("Indian context database created successfully!")

if __name__ == "__main__":
    create_indian_database()
