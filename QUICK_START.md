# Quick Start Guide - Digital Notary Platform

## 🚀 Get Started Locally

This guide will help you set up and run the Digital Notary Platform on your machine without containers.

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- PostgreSQL 16+
- Redis
- Git

## Step 1: Clone and configure

```bash
git clone <your-repo-url>
cd NotaryChain
cp .env.example .env
```

## Step 2: Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at http://localhost:8000.

## Step 3: Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## Step 4: Start background tasks

```bash
cd backend
celery -A celery_app worker --loglevel=info
```

## Step 5: Verify the app

- Backend docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
