from fastapi import FastAPI
from .core.database import init_db
from .api import claim_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BitWizard Fraud Detection System",
    description="AI-powered fraud detection using XGBoost, Neo4j Louvain algorithm, and SHAP explainable AI",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

# Include routers
app.include_router(claim_router.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "BitWizard Fraud Detection API is running",
        "version": "1.0.0",
        "features": [
            "B2B FHIR claim ingestion",
            "Direct consumer mobile claims",
            "XGBoost fraud detection",
            "Neo4j Louvain fraud ring detection",
            "SHAP explainable AI",
            "Real-time dashboard"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "bitwizard-fraud-detection-api"}
