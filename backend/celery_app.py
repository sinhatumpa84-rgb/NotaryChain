"""
Celery application for background tasks
"""
from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "digital_notary",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.document_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.fraud_tasks",
        "app.tasks.cleanup_tasks",
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    result_expires=3600,  # 1 hour
)

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.document_tasks.*": {"queue": "documents"},
    "app.tasks.notification_tasks.*": {"queue": "notifications"},
    "app.tasks.fraud_tasks.*": {"queue": "fraud"},
    "app.tasks.cleanup_tasks.*": {"queue": "cleanup"},
}

# Periodic tasks
celery_app.conf.beat_schedule = {
    "cleanup-expired-sessions": {
        "task": "app.tasks.cleanup_tasks.cleanup_expired_sessions",
        "schedule": 3600.0,  # Every hour
    },
    "cleanup-temp-files": {
        "task": "app.tasks.cleanup_tasks.cleanup_temp_files",
        "schedule": 1800.0,  # Every 30 minutes
    },
    "generate-daily-reports": {
        "task": "app.tasks.cleanup_tasks.generate_daily_reports",
        "schedule": 86400.0,  # Every day
    },
}

if __name__ == "__main__":
    celery_app.start()
