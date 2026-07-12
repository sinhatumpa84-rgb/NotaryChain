#!/bin/bash

# Digital Notary Platform - Celery Worker Startup Script

echo "Starting Celery Worker..."

# Wait for Redis
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# Start Celery worker
exec celery -A celery_app worker --loglevel=info --concurrency=4
