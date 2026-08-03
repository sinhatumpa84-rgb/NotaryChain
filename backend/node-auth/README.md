# NotaryChain Node Auth Service

This service provides a production-ready authentication layer for a Node.js + Express + TypeScript backend using Firebase Authentication and Redis.

## Features
- Firebase Admin SDK initialization from environment variables
- Firebase ID token verification middleware for protected routes
- OTP-based two-step login backed by Redis
- Redis-backed session metadata and refresh token rotation
- Rate limiting by Redis counters
- Zod validation and structured error handling

## Folder structure
- src/config/ — Firebase and Redis configuration
- src/controllers/ — request handlers
- src/middleware/ — auth guard middleware
- src/routes/ — API routes
- src/services/ — business logic for OTP, sessions, and users

## Setup
1. Copy .env.example to .env and fill in the required values.
2. Install dependencies: npm install
3. Start the API: npm run dev
4. Run tests: npm test

## Auth endpoints
- POST /auth/signup
- POST /auth/login
- POST /auth/verify-otp
- POST /auth/resend-otp
- POST /auth/logout
- POST /auth/refresh-token

## Security notes
- Never hardcode secrets in source code.
- The Firebase private key is read from environment variables only.
- OTPs are stored in Redis with TTL and deleted after successful verification.
