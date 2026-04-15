"""
Authentication API endpoints for BitWizard Insurance System
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets
import hashlib
from typing import Optional

from ..core.database import get_db
from ..models.postgres import Base

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: Optional[bool] = False

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str
    role: str  # 'customer' or 'insurer'
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    phone: str
    aadhaar: Optional[str] = None
    license_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    first_name: str
    last_name: str
    is_active: bool
    is_verified: bool

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    message: str
    redirect_url: Optional[str] = None

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(32)

@router.post("/login", response_model=AuthResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and create session"""
    try:
        # Hash the password
        password_hash = hash_password(login_data.password)
        
        # Authenticate user using database function
        result = db.execute(text("""
            SELECT * FROM authenticate_user(:username, :password)
        """), {"username": login_data.username, "password": password_hash})
        
        user_data = result.fetchone()
        
        if not user_data:
            # Check if user exists but password is wrong
            user_exists = db.execute(text("""
                SELECT username FROM users WHERE username = :username
            """), {"username": login_data.username}).fetchone()
            
            if user_exists:
                # Increment login attempts
                db.execute(text("""
                    UPDATE users 
                    SET login_attempts = login_attempts + 1,
                    updated_at = NOW()
                    WHERE username = :username
                """), {"username": login_data.username})
                db.commit()
                
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid username or password"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
        
        # Check if user is locked
        if user_data[9] and user_data[9] > datetime.now():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked. Please try again later."
            )
        
        # Check if user is verified
        if not user_data[8]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account not verified. Please check your email."
            )
        
        # Reset login attempts on successful login
        db.execute(text("""
            UPDATE users 
            SET login_attempts = 0, last_login = NOW(), updated_at = NOW()
            WHERE id = :user_id
        """), {"user_id": user_data[0]})
        
        # Create session token
        session_token = generate_session_token()
        expires_at = datetime.now() + (timedelta(days=30) if login_data.remember_me else timedelta(hours=24))
        
        db.execute(text("""
            SELECT create_user_session(:user_id, :session_token, :expires_at)
        """), {
            "user_id": user_data[0],
            "session_token": session_token,
            "expires_at": expires_at
        })
        
        # Log activity
        db.execute(text("""
            INSERT INTO user_activity_log (user_id, action, description, success)
            VALUES (:user_id, 'login', 'User logged in successfully', TRUE)
        """), {"user_id": user_data[0]})
        
        db.commit()
        
        # Prepare response
        user_response = UserResponse(
            id=user_data[0],
            username=user_data[1],
            email=user_data[2],
            role=user_data[3],
            first_name=user_data[4],
            last_name=user_data[5],
            is_active=user_data[6],
            is_verified=user_data[7]
        )
        
        # Determine redirect URL based on role
        redirect_url = f"/{user_data[3]}/dashboard" if user_data[3] in ['customer', 'insurer'] else "/dashboard"
        
        return AuthResponse(
            success=True,
            user=user_response,
            token=session_token,
            message="Login successful",
            redirect_url=redirect_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/signup", response_model=AuthResponse)
async def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
    """Register new user"""
    try:
        # Validate passwords match
        if signup_data.password != signup_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        # Validate role
        if signup_data.role not in ['customer', 'insurer']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'customer' or 'insurer'"
            )
        
        # Check if username already exists
        existing_user = db.execute(text("""
            SELECT username FROM users WHERE username = :username
        """), {"username": signup_data.username}).fetchone()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        
        # Check if email already exists
        existing_email = db.execute(text("""
            SELECT email FROM users WHERE email = :email
        """), {"email": signup_data.email}).fetchone()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        
        # Validate role-specific fields
        if signup_data.role == 'customer' and not signup_data.aadhaar:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aadhaar number is required for customer registration"
            )
        
        if signup_data.role == 'insurer' and not signup_data.license_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License number is required for insurer registration"
            )
        
        # Hash password
        password_hash = hash_password(signup_data.password)
        
        # Create user
        result = db.execute(text("""
            INSERT INTO users (username, email, password_hash, role, first_name, middle_name, last_name, phone, is_verified)
            VALUES (:username, :email, :password_hash, :role, :first_name, :middle_name, :last_name, :phone, FALSE)
            RETURNING id
        """), {
            "username": signup_data.username,
            "email": signup_data.email,
            "password_hash": password_hash,
            "role": signup_data.role,
            "first_name": signup_data.first_name,
            "middle_name": signup_data.middle_name,
            "last_name": signup_data.last_name,
            "phone": signup_data.phone
        })
        
        user_id = result.fetchone()[0]
        
        # Create corresponding customer/insurer record
        if signup_data.role == 'customer':
            db.execute(text("""
                INSERT INTO customers (user_id, aadhaar, name, phone, email, city, state, digilocker_verified)
                VALUES (:user_id, :aadhaar, :full_name, :phone, :email, 'Mumbai', 'Maharashtra', FALSE)
            """), {
                "user_id": user_id,
                "aadhaar": signup_data.aadhaar,
                "full_name": f"{signup_data.first_name} {signup_data.middle_name or ''} {signup_data.last_name}",
                "phone": signup_data.phone,
                "email": signup_data.email
            })
        
        elif signup_data.role == 'insurer':
            db.execute(text("""
                INSERT INTO insurers (user_id, company_name, license_number, contact_person, phone, email)
                VALUES (:user_id, :company_name, :license_number, :contact_person, :phone, :email)
            """), {
                "user_id": user_id,
                "company_name": f"{signup_data.first_name} {signup_data.last_name} Insurance",
                "license_number": signup_data.license_number,
                "contact_person": f"{signup_data.first_name} {signup_data.middle_name or ''} {signup_data.last_name}",
                "phone": signup_data.phone,
                "email": signup_data.email
            })
        
        # Log activity
        db.execute(text("""
            INSERT INTO user_activity_log (user_id, action, description, success)
            VALUES (:user_id, 'signup', 'User registered successfully', TRUE)
        """), {"user_id": user_id})
        
        db.commit()
        
        # Create session token
        session_token = generate_session_token()
        expires_at = datetime.now() + timedelta(hours=24)
        
        db.execute(text("""
            SELECT create_user_session(:user_id, :session_token, :expires_at)
        """), {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at
        })
        
        db.commit()
        
        # Prepare response
        user_response = UserResponse(
            id=user_id,
            username=signup_data.username,
            email=signup_data.email,
            role=signup_data.role,
            first_name=signup_data.first_name,
            last_name=signup_data.last_name,
            is_active=True,
            is_verified=False  # New users need verification
        )
        
        return AuthResponse(
            success=True,
            user=user_response,
            token=session_token,
            message="Registration successful. Please verify your email.",
            redirect_url=f"/{signup_data.role}/dashboard"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/logout")
async def logout(token: str, db: Session = Depends(get_db)):
    """Logout user and invalidate session"""
    try:
        # Invalidate session
        db.execute(text("""
            UPDATE user_sessions 
            SET is_active = FALSE 
            WHERE session_token = :token
        """), {"token": token})
        
        # Get user_id for logging
        session_data = db.execute(text("""
            SELECT user_id FROM user_sessions WHERE session_token = :token
        """), {"token": token}).fetchone()
        
        if session_data:
            db.execute(text("""
                INSERT INTO user_activity_log (user_id, action, description, success)
                VALUES (:user_id, 'logout', 'User logged out successfully', TRUE)
            """), {"user_id": session_data[0]})
        
        db.commit()
        
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@router.get("/validate", response_model=UserResponse)
async def validate_session(token: str, db: Session = Depends(get_db)):
    """Validate user session token"""
    try:
        result = db.execute(text("""
            SELECT * FROM validate_session(:token)
        """), {"token": token})
        
        user_data = result.fetchone()
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        return UserResponse(
            id=user_data[0],
            username=user_data[1],
            email=user_data[2],
            role=user_data[3],
            first_name=user_data[4],
            last_name=user_data[5],
            is_active=user_data[6]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Session validation failed: {str(e)}"
        )

@router.get("/me")
async def get_current_user(token: str, db: Session = Depends(get_db)):
    """Get current user details"""
    return await validate_session(token, db)

@router.get("/check-username/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    """Check if username is available"""
    try:
        result = db.execute(text("""
            SELECT COUNT(*) FROM users WHERE username = :username
        """), {"username": username})
        
        count = result.fetchone()[0]
        return {"available": count == 0}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Username check failed: {str(e)}"
        )
