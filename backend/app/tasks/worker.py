from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

app = Celery(
    "fraud_workers",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.fraud_tasks"]
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
