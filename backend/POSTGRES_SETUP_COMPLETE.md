# PostgreSQL Setup Complete - BitWizard Insurance Fraud Detection System

## Status: READY FOR AI TRAINING

### Database Information
- **Database Name**: `bitwizard_insurance`
- **Connection String**: `postgresql://smit@localhost:5432/bitwizard_insurance`
- **PostgreSQL Version**: 16.13 (Homebrew)
- **Status**: Fully operational with Indian context data

### Database Schema
| Table | Records | Description |
|-------|---------|-------------|
| `customers` | 20 | Indian customers with Aadhaar verification |
| `insurers` | 5 | Indian insurance companies with IRDA registration |
| `claims` | 50 | Insurance claims with fraud scores |
| `ai_model_performance` | 0 | Ready for AI model tracking |
| `ml_training_data` | 50 | Materialized view for ML training |
| `real_time_analytics` | 4 | Real-time analytics by claim type |

### Indian Context Data
- **Names**: All Indian names (Sara Sharma, Amit Patel, etc.)
- **Currency**: All amounts in INR (Rupees)
- **Locations**: Indian cities (Mumbai, Delhi, Bangalore, etc.)
- **Verification**: Aadhaar-based authentication ready
- **Companies**: Indian insurance companies (LIC, ICICI, HDFC, etc.)

### Fraud Detection Statistics
```
Corporate: 12 claims, Avg fraud: 0.578, Range: 0.220-0.890
Auto: 9 claims, Avg fraud: 0.576, Range: 0.220-0.920
Health: 17 claims, Avg fraud: 0.558, Range: 0.210-0.950
Life: 12 claims, Avg fraud: 0.538, Range: 0.210-0.880
```

### Amount Ranges (INR)
```
Auto: Rs.82,094 - Rs.198,201 (Avg: Rs.136,812)
Corporate: Rs.230,834 - Rs.971,557 (Avg: Rs.585,943)
Health: Rs.50,007 - Rs.148,012 (Avg: Rs.86,144)
Life: Rs.1,038,589 - Rs.4,394,823 (Avg: Rs.2,577,717)
```

### Risk Distribution
- **High Risk (>0.7)**: 15 claims (30%)
- **Medium Risk (0.3-0.7)**: 25 claims (50%)
- **Low Risk (<0.3)**: 10 claims (20%)

### AI Training Features
- **Materialized Views**: ML training data ready
- **Performance Indexes**: 13 optimized indexes
- **Real-time Analytics**: Live fraud detection metrics
- **Model Performance Tracking**: Ready for AI model evaluation

### Backend Configuration
The backend is configured to use PostgreSQL:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://smit@localhost:5432/bitwizard_insurance"
```

### Test Results
```
PostgreSQL Connection: PASS
SQLAlchemy Connection: PASS
AI Training Data: PASS
Real-time Features: PASS
```

## Next Steps for AI Training

### 1. Start the Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### 2. Test API Endpoints
```bash
# Test database connection
curl http://localhost:8000/health

# Test claim submission
curl -X POST http://localhost:8000/api/claims/submit \
  -H "Content-Type: application/json" \
  -d '{
    "claim_type": "health",
    "patient_name": "Sara Sharma",
    "total_amount": 75000,
    "diagnosis_code": "A01",
    "diagnosis_description": "Fever"
  }'
```

### 3. AI Model Training
The database is ready for:
- XGBoost fraud detection model training
- Real-time fraud scoring
- Model performance tracking
- Continuous learning from new claims

### 4. Frontend Integration
The frontend can now connect to PostgreSQL for:
- Real-time claim status updates
- AI-powered fraud detection results
- Indian context data display
- Persistent user sessions

## Database Maintenance

### Refresh Materialized Views
```sql
-- Refresh ML training data
REFRESH MATERIALIZED VIEW CONCURRENTLY ml_training_data;

-- Refresh real-time analytics
REFRESH MATERIALIZED VIEW CONCURRENTLY real_time_analytics;
```

### Monitor Performance
```sql
-- Check query performance
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### Backup Database
```bash
# Create backup
pg_dump -U smit bitwizard_insurance > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U smit bitwizard_insurance < backup_20250413.sql
```

## Environment Variables
```bash
export DATABASE_URL="postgresql://smit@localhost:5432/bitwizard_insurance"
export POSTGRES_HOST="localhost"
export POSTGRES_PORT="5432"
export POSTGRES_DB="bitwizard_insurance"
export POSTGRES_USER="smit"
export POSTGRES_PASSWORD=""
```

## Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgres

# Restart PostgreSQL
brew services restart postgresql@16
```

### Database Issues
```bash
# Connect to database
psql -U smit -d bitwizard_insurance

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM claims;
```

## Production Considerations
- Set up proper database user with limited permissions
- Configure connection pooling for high traffic
- Set up automated backups
- Monitor database performance
- Implement database replication for high availability

---

**Status**: PostgreSQL database is fully operational and ready for AI training with Indian context data.
