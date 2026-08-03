# Manual setup steps

1. Install Python 3.11+, Node.js 20+, PostgreSQL 16+, Redis, and Git.
2. Create a local PostgreSQL database named `notarychain`.
3. Create a Python virtual environment in the backend directory and install dependencies.
4. Copy `.env.example` to `.env` and update the connection values for your local machine.
5. Run backend migrations with `alembic upgrade head`.
6. Start the backend with `uvicorn app.main:app --reload`.
7. Start the frontend with `npm install` and `npm run dev`.
8. Start Redis locally with `redis-server`.
9. Open http://localhost:3000 and http://localhost:8000/docs to confirm the app is running.
