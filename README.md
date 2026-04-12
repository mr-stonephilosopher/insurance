# Insurance Fraud Detection System

A comprehensive fraud detection platform that uses advanced machine learning and graph analytics to identify suspicious insurance claims in real-time.

## Architecture Overview

This system implements a multi-phase fraud detection pipeline:

### Phase 1: Data Ingestion
- **B2B Institutional Route**: FHIR JSON payloads via NHCX gateway with structured medical data
- **Direct Consumer Route**: Mobile app SDK with Google Play Integrity, DigiLocker verification, and MediaPipe liveness checks

### Phase 2: Data Splitting
- **PostgreSQL**: Source of truth for claim records and human-readable data
- **Neo4j**: Relationship mapper for entity connections and network analysis

### Phase 3: Asynchronous ML Processing
- **XGBoost**: Deterministic fraud probability scoring with feature engineering
- **Louvain Algorithm**: Graph-based fraud ring detection in Neo4j
- **Celery**: Asynchronous task processing with Redis broker

### Phase 4: Synthesis & Human-in-the-Loop
- **SHAP**: Explainable AI for fraud score interpretation
- **FastAPI**: Final fraud score calculation and API endpoints
- **Dashboard**: Real-time interface for insurance adjusters

## Technology Stack

- **Backend**: FastAPI, SQLAlchemy, Celery
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Databases**: PostgreSQL, Neo4j, Redis
- **ML/AI**: XGBoost, SHAP, Neo4j Graph Data Science
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM available

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd insurance-fraud-detection
```

2. Start all services:
```bash
docker-compose up -d
```

3. Wait for services to initialize (2-3 minutes):
```bash
docker-compose logs -f backend
```

4. Access the applications:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

## API Endpoints

### Claim Submission

#### B2B FHIR Claims
```http
POST /api/v1/claims/b2b/fhir
Content-Type: application/json

{
  "claim_id": "CLAIM-001",
  "hospital_id": "HOSP-001",
  "attending_doctor_id": "DOC-001",
  "policyholder_id": "POL-001",
  "patient_name": "John Doe",
  "diagnosis_code": "A01.0",
  "total_amount": 1500.00,
  "itemized_billing": [...],
  "service_date": "2024-01-15T10:00:00Z"
}
```

#### Consumer Mobile Claims
```http
POST /api/v1/claims/consumer/mobile
Content-Type: application/json

{
  "claim_id": "CLAIM-002",
  "policyholder_id": "POL-002",
  "patient_name": "Jane Smith",
  "claim_amount": 850.00,
  "claim_date": "2024-01-16T14:30:00Z",
  "google_play_integrity_token": "...",
  "digilocker_verification_hash": "...",
  "mediapipe_liveness_passed": true
}
```

### Claim Management

#### Get Claim Details
```http
GET /api/v1/claims/{claim_id}
```

#### List Claims (with filters)
```http
GET /api/v1/claims/?status=pending&severity=HIGH&requires_review=true
```

#### Update Claim Status
```http
PUT /api/v1/claims/{claim_id}/status
Content-Type: application/json

{
  "new_status": "approved",
  "adjuster_notes": "Verified documentation"
}
```

### Fraud Ring Analysis

#### List Detected Fraud Rings
```http
GET /api/v1/claims/fraud-rings/
```

#### Get Claim Audit Trail
```http
GET /api/v1/claims/audit/{claim_id}
```

## Features

### Fraud Detection Models

1. **XGBoost Model**:
   - Historical claim pattern analysis
   - Feature engineering for risk scoring
   - Real-time probability calculation

2. **Louvain Community Detection**:
   - Graph-based fraud ring identification
   - Entity relationship analysis
   - Network anomaly detection

3. **SHAP Explainability**:
   - Interpretable AI explanations
   - Feature importance visualization
   - Human-readable risk factors

### Security Features

- **Google Play Integrity**: Mobile app attestation
- **DigiLocker Integration**: Document verification
- **MediaPipe Liveness**: Biometric verification
- **Audit Logging**: Complete transaction trail

### Dashboard Capabilities

- Real-time claim monitoring
- Fraud ring visualization
- Risk score analytics
- Claim status management
- Audit trail inspection

## Development

### Local Development

1. Install dependencies:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

2. Start services individually:
```bash
# Database services
docker-compose up -d postgres neo4j redis

# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
npm run dev

# Celery Worker
cd backend
celery -A app.ml.celery_tasks worker --loglevel=info

# Celery Beat (scheduler)
celery -A app.ml.celery_tasks beat --loglevel=info
```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm test
```

### Configuration

Environment variables (create `.env` file):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fraud_detection
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
REDIS_URL=redis://localhost:6379/0
```

## Architecture Diagram

```
[B2B Gateway]     [Mobile App]
       |               |
       v               v
    [FastAPI] <--> [Neo4j Graph]
       |               |
       v               |
   [PostgreSQL] <-----|
       |
       v
    [Celery] <--> [Redis]
       |
    [XGBoost + SHAP]
```

## Monitoring and Logging

- **Application Logs**: Structured logging with ELK stack integration
- **Performance Metrics**: Prometheus metrics available
- **Health Checks**: `/health` endpoint for service monitoring
- **Database Analytics**: Built-in views for claim and fraud ring analytics

## Production Deployment

### Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=4
```

### Kubernetes

Kubernetes manifests available in `/k8s/` directory.

## Security Considerations

- All API endpoints use HTTPS in production
- Database connections use SSL
- Neo4j authentication enabled
- Redis password protection
- Environment-based secret management
- Regular security updates for all dependencies

## Performance Optimization

- Database indexing on key fields
- Connection pooling for all databases
- Asynchronous processing for ML tasks
- Caching with Redis
- Load balancing ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the architecture documentation in `/docs/`
