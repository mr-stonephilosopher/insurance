#!/usr/bin/env python3
"""
Test complete authentication flow with PostgreSQL
"""

import asyncio
import httpx
import json
from datetime import datetime

API_BASE_URL = "http://localhost:8000/api/v1"

async def test_complete_auth_flow():
    """Test complete authentication flow"""
    print("=== Testing Complete Authentication Flow ===")
    
    async with httpx.AsyncClient() as client:
        # Test 1: Health check
        print("\n1. Testing API Health...")
        try:
            response = await client.get(f"{API_BASE_URL}/../health")
            if response.status_code == 200:
                print("✓ API is healthy")
            else:
                print(f"✗ API health check failed: {response.status_code}")
        except Exception as e:
            print(f"✗ API health check error: {e}")
        
        # Test 2: User login with database
        print("\n2. Testing User Login...")
        login_data = {
            "username": "sara.sharma",
            "password": "password123",
            "remember_me": False
        }
        
        try:
            response = await client.post(f"{API_BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                auth_response = response.json()
                if auth_response.get("success"):
                    print(f"✓ Login successful: {auth_response.get('user', {}).get('username')}")
                    print(f"✓ User role: {auth_response.get('user', {}).get('role')}")
                    print(f"✓ Redirect URL: {auth_response.get('redirect_url')}")
                    print(f"✓ Session token: {auth_response.get('token', '')[:20]}...")
                    
                    # Test 3: Session validation
                    print("\n3. Testing Session Validation...")
                    token = auth_response.get('token')
                    if token:
                        validate_response = await client.get(f"{API_BASE_URL}/auth/validate?token={token}")
                        
                        if validate_response.status_code == 200:
                            user_data = validate_response.json()
                            print(f"✓ Session valid: {user_data.get('username')}")
                            print(f"✓ User role: {user_data.get('role')}")
                        else:
                            print("✗ Session validation failed")
                else:
                    print(f"✗ Login failed: {auth_response.get('message')}")
            else:
                print(f"✗ Login request failed: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"✗ Login test error: {e}")
        
        # Test 4: User registration
        print("\n4. Testing User Registration...")
        new_user_data = {
            "username": "test.user",
            "email": "test.user@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "role": "customer",
            "first_name": "Test",
            "middle_name": "Kumar",
            "last_name": "User",
            "phone": "+91-9876543210",
            "aadhaar": "1234 5678 9012"
        }
        
        try:
            response = await client.post(f"{API_BASE_URL}/auth/signup", json=new_user_data)
            
            if response.status_code == 200:
                signup_response = response.json()
                if signup_response.get("success"):
                    print(f"✓ Registration successful: {signup_response.get('user', {}).get('username')}")
                    print(f"✓ User role: {signup_response.get('user', {}).get('role')}")
                    print(f"✓ Redirect URL: {signup_response.get('redirect_url')}")
                else:
                    print(f"✗ Registration failed: {signup_response.get('message')}")
            else:
                print(f"✗ Registration request failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Registration test error: {e}")
        
        # Test 5: Username availability check
        print("\n5. Testing Username Availability...")
        try:
            response = await client.get(f"{API_BASE_URL}/auth/check-username/new.user")
            
            if response.status_code == 200:
                availability = response.json()
                if availability.get("available"):
                    print("✓ Username 'new.user' is available")
                else:
                    print("✗ Username 'new.user' is not available")
            else:
                print(f"✗ Username check failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Username check error: {e}")
        
        # Test 6: Logout functionality
        print("\n6. Testing Logout...")
        login_response = await client.post(f"{API_BASE_URL}/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            auth_data = login_response.json()
            token = auth_data.get('token')
            
            if token:
                try:
                    logout_response = await client.post(
                        f"{API_BASE_URL}/auth/logout",
                        json={"token": token}
                    )
                    
                    if logout_response.status_code == 200:
                        print("✓ Logout successful")
                    else:
                        print(f"✗ Logout failed: {logout_response.status_code}")
                except Exception as e:
                    print(f"✗ Logout test error: {e}")
        
        # Test 7: Invalid credentials
        print("\n7. Testing Invalid Credentials...")
        invalid_login = {
            "username": "invalid.user",
            "password": "wrongpassword"
        }
        
        try:
            response = await client.post(f"{API_BASE_URL}/auth/login", json=invalid_login)
            
            if response.status_code == 401:
                print("✓ Invalid credentials properly rejected")
            else:
                print(f"✗ Invalid credentials test failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Invalid credentials test error: {e}")
        
        # Test 8: Database user data
        print("\n8. Testing Database User Data...")
        try:
            # Get user data from database directly
            import psycopg2
            
            db_params = {
                'host': 'localhost',
                'port': '5432',
                'database': 'bitwizard_insurance',
                'user': 'smit',
                'password': ''
            }
            
            conn = psycopg2.connect(**db_params)
            cursor = conn.cursor()
            
            # Check users table
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            print(f"✓ Total users in database: {user_count}")
            
            # Check user roles
            cursor.execute("""
                SELECT role, COUNT(*) 
                FROM users 
                GROUP BY role
                ORDER BY role
            """)
            role_counts = cursor.fetchall()
            
            for role, count in role_counts:
                print(f"✓ {role.title()} users: {count}")
            
            # Check customer-insurer relationships
            cursor.execute("""
                SELECT 
                    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as linked_customers,
                    COUNT(*) FILTER (WHERE user_id IS NULL) as unlinked_customers
                FROM customers
            """)
            customer_stats = cursor.fetchone()
            
            cursor.execute("""
                SELECT 
                    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as linked_insurers,
                    COUNT(*) FILTER (WHERE user_id IS NULL) as unlinked_insurers
                FROM insurers
            """)
            insurer_stats = cursor.fetchone()
            
            print(f"✓ Linked customers: {customer_stats[0]}")
            print(f"✓ Unlinked customers: {customer_stats[1]}")
            print(f"✓ Linked insurers: {insurer_stats[0]}")
            print(f"✓ Unlinked insurers: {insurer_stats[1]}")
            
            # Check sample user details
            cursor.execute("""
                SELECT username, email, role, first_name, last_name, is_active, is_verified
                FROM users 
                WHERE username = 'sara.sharma'
            """)
            user_details = cursor.fetchone()
            
            if user_details:
                print(f"✓ Sample user found: {user_details[0]} ({user_details[2]})")
                print(f"✓ Name: {user_details[3]} {user_details[4]}")
                print(f"✓ Status: {'Active' if user_details[5] else 'Inactive'}")
                print(f"✓ Verified: {'Yes' if user_details[6] else 'No'}")
            
            conn.close()
            
        except Exception as e:
            print(f"✗ Database user data test error: {e}")
        
        # Test 9: Session management
        print("\n9. Testing Session Management...")
        try:
            # Login to get token
            login_response = await client.post(f"{API_BASE_URL}/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                auth_data = login_response.json()
                token = auth_data.get('token')
                
                if token:
                    # Test multiple session validations
                    for i in range(3):
                        validate_response = await client.get(f"{API_BASE_URL}/auth/validate?token={token}")
                        
                        if validate_response.status_code == 200:
                            print(f"✓ Session validation {i+1}: Success")
                        else:
                            print(f"✗ Session validation {i+1}: Failed")
                            break
                        
                        await asyncio.sleep(0.5)  # Small delay between requests
            
        except Exception as e:
            print(f"✗ Session management test error: {e}")
        
        # Test 10: Authentication with different roles
        print("\n10. Testing Role-based Authentication...")
        
        test_roles = [
            ("amit.patel", "password123", "customer"),
            ("lic.agent", "password123", "insurer"),
            ("icici.agent", "password123", "insurer")
        ]
        
        for username, password, expected_role in test_roles:
            role_login = {
                "username": username,
                "password": password,
                "remember_me": False
            }
            
            try:
                response = await client.post(f"{API_BASE_URL}/auth/login", json=role_login)
                
                if response.status_code == 200:
                    auth_data = response.json()
                    if auth_data.get("success"):
                        actual_role = auth_data.get('user', {}).get('role')
                        if actual_role == expected_role:
                            print(f"✓ {username}: Correct role ({actual_role})")
                        else:
                            print(f"✗ {username}: Wrong role (expected {expected_role}, got {actual_role})")
                else:
                    print(f"✗ {username}: Login failed")
            except Exception as e:
                print(f"✗ {username} test error: {e}")
    
    print(f"\n=== Authentication Flow Test Complete ===")
    print("Time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("\nNext steps:")
    print("1. Start backend: python -m uvicorn app.main:app --reload")
    print("2. Start frontend: cd src && npm run dev")
    print("3. Test login at: http://localhost:3000/login")
    print("4. Verify dashboard redirects work correctly")

if __name__ == "__main__":
    asyncio.run(test_complete_auth_flow())
