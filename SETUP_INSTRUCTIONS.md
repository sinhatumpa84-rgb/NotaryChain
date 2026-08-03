# Setup Instructions

This project is configured for local development. Install PostgreSQL and Redis directly on your machine, then start the backend and frontend services locally.

## 1. Prerequisites

Install the following tools:

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Redis
- Git

## 2. Create the database

Create a local PostgreSQL database:

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

Create a local environment file from the example:

```bash
cd ..
copy .env.example .env
```

Run the migrations:

```bash
cd backend
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## 5. Redis

Install Redis locally and start it:

```bash
redis-server
```

## 6. Verification

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000
