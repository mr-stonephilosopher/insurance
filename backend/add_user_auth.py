#!/usr/bin/env python3
"""
Add user authentication table and update existing tables with user relationships
"""

import psycopg2
import os
import hashlib
from datetime import datetime

# Database connection parameters
db_params = {
    'host': 'localhost',
    'port': '5432',
    'database': 'bitwizard_insurance',
    'user': 'smit',
    'password': ''
}

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def add_user_authentication():
    """Add user authentication table and update schema"""
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        print("=== Adding User Authentication to Database ===")
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(64) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'insurer', 'admin')),
                first_name VARCHAR(50) NOT NULL,
                middle_name VARCHAR(50),
                last_name VARCHAR(50) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP
            )
        ''')
        
        # Create indexes for users table
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)")
        
        # Add user_id foreign key to customers table
        cursor.execute('''
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
        ''')
        
        # Add user_id foreign key to insurers table
        cursor.execute('''
            ALTER TABLE insurers 
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
        ''')
        
        # Create user_sessions table for session management
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address INET,
                user_agent TEXT,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')
        
        # Create indexes for sessions
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)")
        
        # Create user_activity_log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_activity_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(50) NOT NULL,
                description TEXT,
                ip_address INET,
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT TRUE
            )
        ''')
        
        # Create indexes for activity log
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_log(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON user_activity_log(timestamp)")
        
        conn.commit()
        print("User authentication tables created successfully!")
        
        # Create sample users
        print("\n=== Creating Sample Users ===")
        
        # Sample customer users
        sample_customers = [
            {
                'username': 'sara.sharma',
                'email': 'sara.sharma@gmail.com',
                'password': 'password123',
                'role': 'customer',
                'first_name': 'Sara',
                'middle_name': 'Kumari',
                'last_name': 'Sharma',
                'phone': '+91-9876543210'
            },
            {
                'username': 'amit.patel',
                'email': 'amit.patel@gmail.com',
                'password': 'password123',
                'role': 'customer',
                'first_name': 'Amit',
                'middle_name': 'Kumar',
                'last_name': 'Patel',
                'phone': '+91-9876543211'
            },
            {
                'username': 'priya.gupta',
                'email': 'priya.gupta@gmail.com',
                'password': 'password123',
                'role': 'customer',
                'first_name': 'Priya',
                'middle_name': 'Kumari',
                'last_name': 'Gupta',
                'phone': '+91-9876543212'
            }
        ]
        
        # Sample insurer users
        sample_insurers = [
            {
                'username': 'lic.agent',
                'email': 'agent@licindia.com',
                'password': 'password123',
                'role': 'insurer',
                'first_name': 'Rajesh',
                'middle_name': 'Kumar',
                'last_name': 'Singh',
                'phone': '+91-9876543213'
            },
            {
                'username': 'icici.agent',
                'email': 'agent@iciciprulential.com',
                'password': 'password123',
                'role': 'insurer',
                'first_name': 'Vikram',
                'middle_name': 'Prasad',
                'last_name': 'Shah',
                'phone': '+91-9876543214'
            }
        ]
        
        # Insert sample users
        all_users = sample_customers + sample_insurers
        
        for user_data in all_users:
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, role, first_name, middle_name, last_name, phone, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (username) DO NOTHING
                RETURNING id
            ''', (
                user_data['username'],
                user_data['email'],
                hash_password(user_data['password']),
                user_data['role'],
                user_data['first_name'],
                user_data['middle_name'],
                user_data['last_name'],
                user_data['phone'],
                True  # Mark sample users as verified
            ))
            
            result = cursor.fetchone()
            if result:
                user_id = result[0]
                print(f"Created user: {user_data['username']} (ID: {user_id})")
                
                # Link user to existing customer/insurer records
                if user_data['role'] == 'customer':
                    cursor.execute('''
                        UPDATE customers 
                        SET user_id = %s 
                        WHERE name LIKE %s 
                        AND user_id IS NULL
                    ''', (user_id, f"%{user_data['first_name']}%{user_data['last_name']}%"))
                    
                elif user_data['role'] == 'insurer':
                    cursor.execute('''
                        UPDATE insurers 
                        SET user_id = %s 
                        WHERE company_name LIKE %s 
                        AND user_id IS NULL
                    ''', (user_id, f"%{user_data['first_name']}%"))
        
        conn.commit()
        print("Sample users created and linked successfully!")
        
        # Create authentication functions
        print("\n=== Creating Authentication Functions ===")
        
        # Function to validate user login
        cursor.execute('''
            CREATE OR REPLACE FUNCTION authenticate_user(
                p_username VARCHAR(50),
                p_password VARCHAR(255)
            ) RETURNS TABLE (
                user_id INTEGER,
                username VARCHAR(50),
                email VARCHAR(100),
                role VARCHAR(20),
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                is_active BOOLEAN,
                is_verified BOOLEAN,
                login_attempts INTEGER,
                locked_until TIMESTAMP
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.role,
                    u.first_name,
                    u.last_name,
                    u.is_active,
                    u.is_verified,
                    u.login_attempts,
                    u.locked_until
                FROM users u
                WHERE u.username = p_username
                AND u.password_hash = encode(SHA256(p_password), 'hex')
                AND u.is_active = TRUE;
            END;
            $$ LANGUAGE plpgsql;
        ''')
        
        # Function to create user session
        cursor.execute('''
            CREATE OR REPLACE FUNCTION create_user_session(
                p_user_id INTEGER,
                p_session_token VARCHAR(255),
                p_expires_at TIMESTAMP,
                p_ip_address INET DEFAULT NULL,
                p_user_agent TEXT DEFAULT NULL
            ) RETURNS INTEGER AS $$
            BEGIN
                INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
                VALUES (p_user_id, p_session_token, p_expires_at, p_ip_address, p_user_agent)
                RETURNING id;
            END;
            $$ LANGUAGE plpgsql;
        ''')
        
        # Function to validate session
        cursor.execute('''
            CREATE OR REPLACE FUNCTION validate_session(
                p_session_token VARCHAR(255)
            ) RETURNS TABLE (
                user_id INTEGER,
                username VARCHAR(50),
                email VARCHAR(100),
                role VARCHAR(20),
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                is_active BOOLEAN
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.role,
                    u.first_name,
                    u.last_name,
                    u.is_active
                FROM users u
                INNER JOIN user_sessions s ON u.id = s.user_id
                WHERE s.session_token = p_session_token
                AND s.expires_at > NOW()
                AND s.is_active = TRUE
                AND u.is_active = TRUE;
            END;
            $$ LANGUAGE plpgsql;
        ''')
        
        conn.commit()
        print("Authentication functions created successfully!")
        
        # Verify setup
        print("\n=== Verification ===")
        
        # Check users table
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"Total users: {user_count}")
        
        # Check customers with user_id
        cursor.execute("SELECT COUNT(*) FROM customers WHERE user_id IS NOT NULL")
        linked_customers = cursor.fetchone()[0]
        print(f"Customers linked to users: {linked_customers}")
        
        # Check insurers with user_id
        cursor.execute("SELECT COUNT(*) FROM insurers WHERE user_id IS NOT NULL")
        linked_insurers = cursor.fetchone()[0]
        print(f"Insurers linked to users: {linked_insurers}")
        
        # Test authentication function
        cursor.execute("SELECT * FROM authenticate_user('sara.sharma', 'password123')")
        auth_result = cursor.fetchone()
        if auth_result:
            print(f"Authentication test: SUCCESS for user ID {auth_result[0]}")
        
        print("\n=== User Authentication Setup Complete ===")
        print("Database is ready for username/password authentication!")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_user_authentication()
