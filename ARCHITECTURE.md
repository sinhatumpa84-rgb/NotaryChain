# Architecture Overview

## Overview

NotaryChain is a local-first platform composed of a FastAPI backend, a Next.js frontend, PostgreSQL, Redis, Supabase Storage, and Firebase Authentication.

## Infrastructure

- Local development on the host machine
- PostgreSQL for transactional data
- Redis for caching and background task coordination
- Supabase Storage for document files
- Firebase Authentication for sign-in and identity workflows
- CI/CD through GitHub Actions
