
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
