#!/usr/bin/env python3
"""
Populate PostgreSQL database with Indian context data
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
        
        print("Populating database with Indian context data...")
        
        # Insert insurers
        for company in insurance_companies:
            cursor.execute('''
                INSERT INTO insurers (company_name, license_number, contact_person, phone, email, website, irda_registration)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (license_number) DO NOTHING
            ''', (
                company,
                f"IRDA-{random.randint(100000, 999999)}",
                generate_indian_name(),
                generate_indian_phone(),
                f"contact@{company.lower().replace(' ', '').replace(',', '')}.com",
                f"https://www.{company.lower().replace(' ', '').replace(',', '')}.com",
                f"IRDA/{random.randint(100, 999)}/{random.randint(2020, 2024)}"
            ))
        
        # Insert customers
        for i in range(20):
            name = generate_indian_name()
            aadhaar = generate_aadhaar()
            phone = generate_indian_phone()
            city = random.choice(cities)
            
            cursor.execute('''
                INSERT INTO customers (aadhaar, name, phone, email, city, state)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO NOTHING
            ''', (
                aadhaar,
                name,
                phone,
                f"{name.lower().replace(' ', '.').replace(',', '')}{i}@gmail.com",
                city,
                random.choice(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'])
            ))
        
        # Get actual customer count first
        cursor.execute("SELECT MAX(id) FROM customers")
        max_customer_id = cursor.fetchone()[0] or 1
        cursor.execute("SELECT MAX(id) FROM insurers")
        max_insurer_id = cursor.fetchone()[0] or 1
        
        # Insert claims
        claim_types = ['health', 'auto', 'life', 'corporate']
        for i in range(50):
            claim_type = random.choice(claim_types)
            customer_id = random.randint(1, max_customer_id)
            insurer_id = random.randint(1, max_insurer_id)
            
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
            
            cursor.execute('''
                INSERT INTO claims (claim_id, customer_id, insurer_id, claim_type, patient_name, total_amount, 
                                 status, fraud_score, severity, source, policyholder_id, documents, ai_summary, risk_factors)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                f"AI analysis indicates {severity} risk with fraud score {fraud_score}",
                f"Risk factors detected for {claim_type} claim"
            ))
        
        conn.commit()
        print("Database populated successfully!")
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM customers")
        customer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM insurers")
        insurer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM claims")
        claim_count = cursor.fetchone()[0]
        
        print(f"Customers: {customer_count}")
        print(f"Insurers: {insurer_count}")
        print(f"Claims: {claim_count}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    populate_database()
