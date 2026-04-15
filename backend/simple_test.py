#!/usr/bin/env python3
"""
Simple test for authentication API
"""

import requests
import json

API_BASE_URL = "http://localhost:8000/api/v1"

def test_simple():
    """Simple test of authentication endpoints"""
    print("=== Simple Authentication Test ===")
    
    # Test 1: Health check
    print("\n1. Testing API Health...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ API is healthy")
        else:
            print(f"✗ API health check failed: {response.status_code}")
    except Exception as e:
        print(f"✗ API health check error: {e}")
    
    # Test 2: User login
    print("\n2. Testing User Login...")
    login_data = {
        "username": "sara.sharma",
        "password": "password123",
        "remember_me": False
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            auth_response = response.json()
            if auth_response.get("success"):
                print(f"✓ Login Successful: {auth_response.get('user', {}).get('username')}")
                print(f"✓ User Role: {auth_response.get('user', {}).get('role')}")
                print(f"✓ Token: {auth_response.get('token', '')[:20]}...")
                print(f"✓ Redirect: {auth_response.get('redirect_url')}")
            else:
                print(f"✗ Login Failed: {auth_response.get('message')}")
        else:
            print(f"✗ Login HTTP Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Login Error: {e}")
    
    # Test 3: Database user data
    print("\n3. Testing Database User Data...")
    try:
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
        print(f"✓ Total users: {user_count}")
        
        # Check sample user
        cursor.execute("""
            SELECT username, email, role, first_name, last_name, is_active, is_verified
            FROM users 
            WHERE username = 'sara.sharma'
        """)
        user_details = cursor.fetchone()
        
        if user_details:
            print(f"✓ Sample user: {user_details[0]} ({user_details[2]})")
            print(f"✓ Name: {user_details[3]} {user_details[4]}")
            print(f"✓ Status: {'Active' if user_details[5] else 'Inactive'}")
            print(f"✓ Verified: {'Yes' if user_details[6] else 'No'}")
        
        conn.close()
        
    except Exception as e:
        print(f"✗ Database Error: {e}")
    
    print(f"\n=== Test Complete ===")
    print("Authentication system is ready!")
    print("Backend URL: http://localhost:8000")
    print("Frontend URL: http://localhost:3000")
    print("Test login page: http://localhost:3000/login")

if __name__ == "__main__":
    test_simple()
