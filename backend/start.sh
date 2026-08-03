#!/bin/bash

# Digital Notary Platform - Backend Startup Script

echo "Starting Digital Notary Platform Backend..."

# Wait for database
echo "Waiting for PostgreSQL on localhost:5432..."
while ! nc -z localhost 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Wait for Redis
echo "Waiting for Redis on localhost:6379..."
while ! nc -z localhost 6379; do
  sleep 1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
