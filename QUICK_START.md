# Quick Start Guide - Digital Notary Platform

## 🚀 Get Started in 5 Minutes

This guide will help you set up and run the Digital Notary Platform locally.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose
- **PostgreSQL** 15+ (or use Docker)
- **Redis** (or use Docker)
- **Git**

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd digital-notary-platform

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## Step 2: Firebase Setup (5 minutes)

Your Firebase project is already configured! Just enable the features:

### 2.1 Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/project/signal-scout-483d5)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Microsoft (requires Azure app setup)
   - ✅ Phone

### 2.2 Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Production mode**
4. Select closest region
5. Click **Enable**

### 2.3 Set Up Security Rules

Copy the rules from `FIREBASE_SETUP.md` section 3 and paste in:
- **Firestore** → **Rules**
- **Storage** → **Rules**

### 2.4 Enable Cloud Storage

1. Go to **Storage**
2. Click **Get Started**
3. Choose same region as Firestore
4. Click **Done**

## Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up database
# Option 1: Use Docker
docker-compose up -d postgres redis

# Option 2: Use local PostgreSQL
# Create database manually and update .env

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

## Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## Step 5: Start Celery (Background Tasks)

```bash
cd backend

# Terminal 1: Start Celery worker
celery -A celery_app worker --loglevel=info

# Terminal 2: Start Celery beat (scheduler)
celery -A celery_app beat --loglevel=info
```

## Step 6: Test the Setup

### Test Backend
```bash
# Check health
curl http://localhost:8000/health

# Check API docs
# Open browser: http://localhost:8000/docs
```

### Test Frontend
```bash
# Open browser
# Navigate to: http://localhost:3000

# You should see the landing page
```

### Test Authentication

1. Go to http://localhost:3000
2. Click **Sign Up** or **Login**
3. Register a new account
4. Check your email for verification link
5. Verify email and login

## 🐳 Docker Quick Start (Recommended)

If you prefer Docker, use this simplified setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Celery Flower (monitoring): http://localhost:5555

## 📁 Project Structure

```
digital-notary-platform/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── tasks/          # Celery tasks
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Firebase, utilities
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── .github/               # CI/CD workflows
├── k8s/                   # Kubernetes manifests
└── docker-compose.yml
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
pytest
pytest -v  # Verbose output
pytest --cov  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 🔑 Default Credentials

After initial setup, you can create test users:

**Super Admin:**
- Email: admin@notary.com
- Password: (set during registration)
- Role: super_admin

**Notary:**
- Email: notary@example.com
- Password: (set during registration)
- Role: notary

**Company:**
- Email: company@example.com
- Password: (set during registration)
- Role: company

## 🔧 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=signal-scout-483d5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=signal-scout-483d5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=signal-scout-483d5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=341229184373
NEXT_PUBLIC_FIREBASE_APP_ID=1:341229184373:web:25341a5acb78b53c6a9f3c
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://notary:notary123@localhost:5432/notary_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# File Storage
STORAGE_TYPE=local  # or s3, minio
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=notary-documents

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## 📱 Firebase Console Access

**Project**: signal-scout-483d5
**Console URL**: https://console.firebase.google.com/project/signal-scout-483d5

Quick links:
- [Authentication](https://console.firebase.google.com/project/signal-scout-483d5/authentication)
- [Firestore](https://console.firebase.google.com/project/signal-scout-483d5/firestore)
- [Storage](https://console.firebase.google.com/project/signal-scout-483d5/storage)
- [Settings](https://console.firebase.google.com/project/signal-scout-483d5/settings/general)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Check database connection
psql -U notary -d notary_db -h localhost

# Check if port 8000 is available
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Check if port 3000 is available
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux/Mac
```

### Firebase errors
- Verify API key in .env.local matches Firebase Console
- Check if authentication methods are enabled
- Ensure Firestore database is created
- Verify security rules are deployed

### Database connection errors
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database exists
psql -U postgres -l

# Create database if missing
createdb -U postgres notary_db
```

## 📚 Next Steps

1. ✅ Complete Firebase setup (see FIREBASE_SETUP.md)
2. ✅ Test authentication flow
3. 🚧 Implement document upload (Task 4)
4. 🚧 Build authentication pages
5. 🚧 Add digital signature support
6. 🚧 Implement notary workflow

See `IMPLEMENTATION_STATUS.md` for full roadmap.

## 🆘 Need Help?

- 📖 Read full documentation: `README.md`
- 🏗️ Architecture details: `ARCHITECTURE.md`
- 🔥 Firebase setup: `FIREBASE_SETUP.md`
- 📊 Implementation status: `IMPLEMENTATION_STATUS.md`
- 🐛 Issues: Create an issue on GitHub
- 💬 Questions: Check discussions or Stack Overflow

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] PostgreSQL database created
- [ ] Redis running
- [ ] Celery worker started
- [ ] Firebase authentication enabled
- [ ] Firestore database created
- [ ] Firebase security rules deployed
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Email verification working

Congratulations! 🎉 Your Digital Notary Platform is ready for development!
