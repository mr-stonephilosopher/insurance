FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for Postgres client, building Python wheels,
# and the OpenMP runtime (libomp) used by XGBoost on macOS/Linux containers.
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    ca-certificates \
    llvm \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Default command used by docker-compose (overridden by services that run celery)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
