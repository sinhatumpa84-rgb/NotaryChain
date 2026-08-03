# Local Development Guide

This project is designed to run locally on your machine.

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Redis
- Git

## 1. Clone the repository

```bash
git clone https://github.com/sinhatumpa84-rgb/NotaryChain.git
cd NotaryChain
```

## 2. Create a local PostgreSQL database

```sql
CREATE DATABASE notarychain;
```

## 3. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create a local `.env` file from `.env.example` and update the connection values if needed.

```bash
cd ..
copy .env.example .env
```

Run migrations:

```bash
cd backend
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000.

## 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## 5. Optional: Redis

Install Redis locally and start it:

```bash
redis-server
```
