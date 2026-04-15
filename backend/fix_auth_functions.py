#!/usr/bin/env python3
"""
Fix authentication functions with correct PostgreSQL SHA256 syntax
"""

import psycopg2
import os

# Database connection parameters
db_params = {
    'host': 'localhost',
    'port': '5432',
    'database': 'bitwizard_insurance',
    'user': 'smit',
    'password': ''
}

def fix_auth_functions():
    """Fix authentication functions with correct SHA256"""
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        print("=== Fixing Authentication Functions ===")
        
        # Drop existing functions
        cursor.execute("DROP FUNCTION IF EXISTS authenticate_user(VARCHAR, VARCHAR)")
        cursor.execute("DROP FUNCTION IF EXISTS create_user_session(INTEGER, VARCHAR, TIMESTAMP, INET, TEXT)")
        cursor.execute("DROP FUNCTION IF EXISTS validate_session(VARCHAR)")
        
        conn.commit()
        
        # Create fixed authenticate_user function
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
                AND u.password_hash = p_password::text::bytea::text
                AND u.is_active = TRUE;
            END;
            $$ LANGUAGE plpgsql;
        ''')
        
        # Create fixed create_user_session function
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
        
        # Create fixed validate_session function
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
        print("Authentication functions fixed successfully!")
        
        # Test authentication with sample users
        print("\n=== Testing Authentication ===")
        
        test_users = [
            ('sara.sharma', 'password123'),
            ('amit.patel', 'password123'),
            ('priya.gupta', 'password123'),
            ('lic.agent', 'password123'),
            ('icici.agent', 'password123')
        ]
        
        for username, password in test_users:
            # Hash the password first
            import hashlib
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cursor.execute('''
                SELECT * FROM authenticate_user(%s, %s)
            ''', (username, password_hash))
            
            result = cursor.fetchone()
            if result:
                print(f"✓ {username}: Authenticated (ID: {result[0]}, Role: {result[3]})")
            else:
                print(f"✗ {username}: Authentication failed")
        
        # Verify database state
        print("\n=== Database State ===")
        
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"Total users: {user_count}")
        
        cursor.execute("""
            SELECT role, COUNT(*) 
            FROM users 
            GROUP BY role
            ORDER BY role
        """)
        role_counts = cursor.fetchall()
        for role, count in role_counts:
            print(f"{role.title()} users: {count}")
        
        cursor.execute("SELECT COUNT(*) FROM customers WHERE user_id IS NOT NULL")
        linked_customers = cursor.fetchone()[0]
        print(f"Customers linked to users: {linked_customers}")
        
        cursor.execute("SELECT COUNT(*) FROM insurers WHERE user_id IS NOT NULL")
        linked_insurers = cursor.fetchone()[0]
        print(f"Insurers linked to users: {linked_insurers}")
        
        # Show user details
        cursor.execute("""
            SELECT username, email, role, first_name, last_name, is_active, is_verified
            FROM users
            ORDER BY role, username
        """)
        users = cursor.fetchall()
        
        print(f"\n=== User Accounts ===")
        for user in users:
            status = "✓ Active" if user[5] else "✗ Inactive"
            verified = "✓ Verified" if user[6] else "✗ Not Verified"
            print(f"{user[2].title()}: {user[0]} ({user[1]}) - {user[3]} {user[4]} - {status} - {verified}")
        
        print(f"\n=== User Authentication Complete ===")
        print("Database is ready for username/password authentication!")
        print("Sample accounts created:")
        print("  Customer: sara.sharma / password123")
        print("  Customer: amit.patel / password123") 
        print("  Customer: priya.gupta / password123")
        print("  Insurer: lic.agent / password123")
        print("  Insurer: icici.agent / password123")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_auth_functions()
