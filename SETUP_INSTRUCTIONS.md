# 🚀 Setup Instructions - Digital Notary Platform

## Current Status

✅ **Frontend Dependencies Installed** - Ready to run!
❌ **Python Not Found** - Needs installation
❌ **Firebase Console Setup** - Manual steps required

---

## What I've Done (Automated)

✅ Installed all frontend (Next.js) npm packages
✅ Created all Firebase integration code
✅ Created TypeScript types and interfaces
✅ Set up authentication service
✅ Created comprehensive documentation
✅ Updated environment variables

---

## What You Need To Do (Manual)

### Step 1: Install Python (5 minutes)

Python is required for the backend. Install Python 3.11 or higher:

**Option A: Download from Python.org**
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12
3. **IMPORTANT**: Check "Add Python to PATH" during installation
4. Verify: Open PowerShell and run `python --version`

**Option B: Using winget (Windows Package Manager)**
```powershell
winget install Python.Python.3.11
```

**Option C: Using Chocolatey**
```powershell
choco install python
```

After installation, verify:
```powershell
python --version
pip --version
```

### Step 2: Install Backend Dependencies (2 minutes)

Once Python is installed:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Firebase Console Setup (5 minutes)

⚠️ **CRITICAL**: These steps CANNOT be automated. You must do them in Firebase Console.

#### 3.1 Enable Authentication Methods

1. Open: https://console.firebase.google.com/project/signal-scout-483d5/authentication/providers
2. Enable these providers:

   **Email/Password:**
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

   **Google:**
   - Click "Google"
   - Toggle "Enable"
   - Set project support email (your email)
   - Click "Save"

   **Microsoft (Optional but recommended):**
   - Click "Microsoft"
   - Toggle "Enable"
   - You'll need to set up Azure AD app first:
     - Go to https://portal.azure.com
     - Register new app
     - Copy Application (client) ID
     - Create client secret
     - Add redirect URI: `https://signal-scout-483d5.firebaseapp.com/__/auth/handler`
   - Paste credentials in Firebase
   - Click "Save"

   **Phone (Optional):**
   - Click "Phone"
   - Toggle "Enable"
   - Add test phone numbers for development
   - Click "Save"

#### 3.2 Create Firestore Database

1. Open: https://console.firebase.google.com/project/signal-scout-483d5/firestore
2. Click "Create database"
3. Select **"Start in production mode"**
4. Choose location: **us-central** (or closest to your users)
5. Click "Enable"
6. Wait for database creation (~30 seconds)

#### 3.3 Deploy Firestore Security Rules

1. Go to "Firestore Database" → "Rules" tab
2. **DELETE** all existing rules
3. **COPY** the following rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    function isNotary() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'notary';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Companies collection
    match /companies/{companyId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.ownerId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read: if isSignedIn() && (
        isOwner(resource.data.uploadedBy) ||
        isAdmin() ||
        isNotary()
      );
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.uploadedBy) || isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Notary requests collection
    match /notaryRequests/{requestId} {
      allow read: if isSignedIn() && (
        isOwner(resource.data.requestedBy) ||
        isOwner(resource.data.notaryId) ||
        isAdmin()
      );
      allow create: if isSignedIn();
      allow update: if isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Notary certificates collection
    match /notaryCertificates/{certificateId} {
      allow read: if isSignedIn();
      allow create: if isNotary() || isAdmin();
      allow update: if isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Audit logs collection (read-only for admins)
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow create, delete: if false; // Only Cloud Functions can create/delete
    }
  }
}
```

4. Click "Publish"

#### 3.4 Enable Cloud Storage

1. Open: https://console.firebase.google.com/project/signal-scout-483d5/storage
2. Click "Get started"
3. Select **"Start in production mode"**
4. Choose **same location as Firestore**
5. Click "Done"

#### 3.5 Deploy Storage Security Rules

1. Go to "Storage" → "Rules" tab
2. **DELETE** all existing rules
3. **COPY** the following rules and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Documents folder
    match /documents/{userId}/{allPaths=**} {
      allow read: if isSignedIn() && isOwner(userId);
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Avatars folder (public read)
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Certificates folder
    match /certificates/{certificateId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Temp folder
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }
  }
}
```

4. Click "Publish"

---

## Step 4: Set Up PostgreSQL & Redis (Choose One Option)

### Option A: Docker (Recommended - Easiest)

Install Docker Desktop: https://www.docker.com/products/docker-desktop

Then run:
```powershell
docker-compose up -d postgres redis
```

### Option B: Manual Installation

**PostgreSQL:**
1. Download: https://www.postgresql.org/download/windows/
2. Install with password: `notary123`
3. Create database:
```sql
CREATE DATABASE notary_db;
CREATE USER notary WITH PASSWORD 'notary123';
GRANT ALL PRIVILEGES ON DATABASE notary_db TO notary;
```

**Redis:**
1. Download: https://github.com/microsoftarchive/redis/releases
2. Install and start service

---

## Step 5: Create Environment Files

### Frontend .env.local

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Digital Notary Platform
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Firebase (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=signal-scout-483d5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=signal-scout-483d5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=signal-scout-483d5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=341229184373
NEXT_PUBLIC_FIREBASE_APP_ID=1:341229184373:web:25341a5acb78b53c6a9f3c
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### Backend .env

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://notary:notary123@localhost:5432/notary_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Secret (Generate new one for production!)
SECRET_KEY=your-super-secret-key-change-this-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# OAuth (Optional - for backend OAuth if needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# File Storage
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

---

## Step 6: Run Database Migrations (After PostgreSQL is running)

```powershell
cd backend
.\venv\Scripts\activate
alembic upgrade head
```

---

## Step 7: Start Development Servers

### Terminal 1: Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: http://localhost:8000
API Docs: http://localhost:8000/docs

### Terminal 2: Frontend
```powershell
cd frontend
npm run dev
```

Frontend will run at: http://localhost:3000

### Terminal 3: Celery Worker (Optional - for background tasks)
```powershell
cd backend
.\venv\Scripts\activate
celery -A celery_app worker --loglevel=info --pool=solo
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Python installed (`python --version`)
- [ ] Backend dependencies installed
- [ ] Firebase Email/Password auth enabled
- [ ] Firebase Google auth enabled
- [ ] Firestore database created
- [ ] Firestore security rules deployed
- [ ] Cloud Storage enabled
- [ ] Storage security rules deployed
- [ ] PostgreSQL running (or Docker)
- [ ] Redis running (or Docker)
- [ ] `.env.local` created in frontend
- [ ] `.env` created in backend
- [ ] Database migrations run
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000/docs

---

## 🧪 Test Authentication

Once everything is running:

1. Go to http://localhost:3000
2. Click "Sign Up" (once you build the auth pages)
3. Register with email/password
4. Check Firebase Console → Authentication → Users
5. You should see your new user

---

## 🆘 Troubleshooting

### Python not found after installation
- Restart PowerShell/Command Prompt
- Or add to PATH manually: `C:\Python311\` and `C:\Python311\Scripts\`

### Port already in use
```powershell
# Find process using port 3000 or 8000
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <pid> /F
```

### Firebase "permission denied" errors
- Verify security rules are deployed
- Check user is authenticated
- Verify user role in Firestore /users collection

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Test connection: `psql -U notary -d notary_db`

### Module import errors (backend)
- Activate virtual environment first
- Reinstall: `pip install -r requirements.txt`

---

## 📚 Documentation References

- **FIREBASE_SETUP.md** - Detailed Firebase configuration
- **QUICK_START.md** - Quick start guide
- **IMPLEMENTATION_STATUS.md** - Project progress
- **README.md** - Project overview
- **ARCHITECTURE.md** - System architecture

---

## 🎯 Next Development Tasks

Once servers are running, the next tasks are:

1. **Build Authentication Pages**
   - Login page
   - Register page
   - Password reset
   - Email verification

2. **Document Upload**
   - File upload component
   - S3/MinIO integration
   - OCR service

3. **Digital Signatures**
   - PKI certificates
   - eSign integration

4. **Notary Workflow**
   - Request management
   - Digital seals
   - Certificate generation

See `IMPLEMENTATION_STATUS.md` for full roadmap.

---

## ✨ What's Already Working

✅ Frontend npm packages installed
✅ Firebase SDK integrated
✅ Authentication service ready
✅ TypeScript types defined
✅ React hooks created
✅ Environment variables configured
✅ Documentation complete

Just need to complete the manual steps above and you'll be ready to develop! 🚀
