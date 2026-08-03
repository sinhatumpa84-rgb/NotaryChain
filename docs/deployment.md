# Deployment Guide

## Development

- Run PostgreSQL locally and create the `notarychain` database.
- Run Redis locally.
- Start the FastAPI backend with `uvicorn app.main:app --reload`.
- Start the Next.js frontend with `npm run dev`.

## Production

Recommended providers:

- Backend: Render, Railway, or DigitalOcean
- Database: PostgreSQL or CockroachDB Cloud
- Frontend: Vercel
- Storage: Supabase Storage

Set the production environment variables from `.env.example` and point the application to the managed services.
