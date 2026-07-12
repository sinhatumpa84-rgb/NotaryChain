# 🚀 Deployment Checklist - Digital Notary Platform

## Summary of Changes

### What Changed
- ❌ **Removed**: Firebase Firestore
- ❌ **Removed**: Firebase Storage
- ✅ **Added**: Supabase PostgreSQL
- ✅ **Added**: Supabase Storage
- ✅ **Kept**: Firebase Authentication (unchanged)

### Architecture
```
Firebase Auth (Authentication) + Supabase (Database & Storage)
```

---

## ✓ Completed Tasks

### Code Changes
- ✅ Removed Firestore imports from `frontend/src/lib/firebase.ts`
- ✅ Created `frontend/src/lib/supabase.ts` - Supabase client
- ✅ Created `frontend/src/services/user-service.ts` - User CRUD operations
- ✅ Created `frontend/src/services/document-service.ts` - Document upload/download
- ✅ Updated `frontend/src/services/auth-service.ts` - Uses Supabase for profiles
- ✅ Created `backend/app/services/supabase_service.py` - Backend Supabase service
- ✅ Updated `frontend/package.json` - Added @supabase/supabase-js
- ✅ Updated `.env.example` - Added Supabase environment variables

### Database & Storage
- ✅ Created SQL schema: `supabase/migrations/001_initial_schema.sql`
  - 10 tables created
  - Indexes for performance
  - Row Level Security policies
  - Triggers for timestamps
- ✅ Created storage setup: `supabase/storage_setup.sql`
  - Private `documents` bucket
  - Storage policies
  - File validation (50MB max, PDF/DOCX/JPEG/PNG)

### Documentation
- ✅ Created `SUPABASE_MIGRATION_GUIDE.md` - Complete migration guide
- ✅ Created `DEPLOYMENT_CHECKLIST.md` - This file
- ✅ Updated `README.md` - Reflected new architecture

---

## ⚠️ Manual Configuration Required

### 1. Supabase Dashboard Setup (15 minutes)

#### 1.1 Run Database Migration
🔗 https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor

1. Click **"New Query"**
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy ALL content
4. Paste into SQL Editor
5. Click **"Run"** (▶️)
6. Wait for **"Success"** message

**Expected Result**: 10 tables created
```
✓ users
✓ companies
✓ documents
✓ document_versions
✓ notary_requests
✓ signatures
✓ audit_logs
✓ notifications
✓ loan_requests
✓ verification_logs
```

#### 1.2 Create Storage Bucket
🔗 https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets

1. Click **"Create bucket"**
2. **Name**: `documents`
3. **Public**: ❌ **NO** (keep private)
4. Click **"Create bucket"**

#### 1.3 Configure Storage Policies
🔗 https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor

1. Click **"New Query"**
2. Open `supabase/storage_setup.sql`
3. Copy ALL content
4. Paste into SQL Editor
5. Click **"Run"** (▶️)

**Expected Result**: Storage policies configured
```
✓ Users can upload to own folder
✓ Users can view own documents
✓ 50MB file size limit
✓ PDF/DOCX/JPEG/PNG allowed
```

### 2. Get API Keys (5 minutes)

🔗 https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/settings/api

Copy these keys:

#### Anon Key (Public - for Frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Use in: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Service Role Key (Secret - for Backend ONLY)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Use in: `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER commit Service Role Key to Git!**

### 3. Update Environment Variables (10 minutes)

#### 3.1 Frontend (`frontend/.env.local`)

```bash
# Firebase Authentication (KEEP AS-IS)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=signal-scout-483d5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=signal-scout-483d5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=signal-scout-483d5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=341229184373
NEXT_PUBLIC_FIREBASE_APP_ID=1:341229184373:web:25341a5acb78b53c6a9f3c
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false

# Supabase (NEW - paste your Anon key)
NEXT_PUBLIC_SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_anon_key_here>
```

#### 3.2 Backend (`backend/.env`)

Get database password from:
🔗 https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/settings/database

```bash
# Supabase (NEW - paste your Service Role key)
SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<paste_service_role_key_here>

# Database Connection
DATABASE_URL=postgresql://postgres.rdnieuljpwvngkkeacpq:<your_db_password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Redis (unchanged)
REDIS_URL=redis://localhost:6379/0

# JWT Secret (unchanged)
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
```

### 4. Install Dependencies (5 minutes)

#### Frontend
```bash
cd frontend
npm install @supabase/supabase-js
```

#### Backend
```bash
cd backend
pip install supabase
```

### 5. Test the Integration (10 minutes)

#### Start Services
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Test Checklist
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] Can register new user
- [ ] User appears in Supabase → Table Editor → users
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Can upload document (PDF/DOCX/JPEG/PNG)
- [ ] Document appears in Supabase → Storage → documents
- [ ] Document metadata in Supabase → Table Editor → documents
- [ ] Can download document with signed URL

---

## ❌ Known Issues / Not Implemented Yet

### File Upload UI
- ❌ No upload UI component created yet
- ⚠️ Need to create: `frontend/src/components/documents/upload-document.tsx`
- 📝 Use `documentService.uploadDocument()` from services

### Document List UI
- ❌ No document list component yet
- ⚠️ Need to create: `frontend/src/components/documents/document-list.tsx`
- 📝 Use `documentService.getDocumentsByUser()` from services

### Backend API Routes
- ❌ No FastAPI routes created yet for documents
- ⚠️ Need to create: `backend/app/api/v1/documents.py`
- 📝 Use `supabase_service` for operations

### Authentication Middleware
- ❌ Backend doesn't verify Firebase tokens with Supabase yet
- ⚠️ Need to update: `backend/app/core/security.py`
- 📝 Add Firebase Admin SDK verification

### OCR Integration
- ❌ OCR not connected to Supabase documents
- ⚠️ Need to update: `backend/app/tasks/document_tasks.py`
- 📝 Store OCR text in documents.ocr_text column

### Fraud Detection
- ❌ Fraud scoring not integrated
- ⚠️ Need to update: `backend/app/tasks/fraud_tasks.py`
- 📝 Store score in documents.fraud_score column

---

## 🔒 Security Checklist

- [ ] Service Role Key stored in secrets manager (not in code)
- [ ] RLS policies tested and working
- [ ] Storage bucket is private (not public)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all uploads
- [ ] File size limits enforced (50MB)
- [ ] MIME type validation working
- [ ] Signed URLs have expiration (default: 1 hour)
- [ ] Audit logs being created
- [ ] SSL/TLS enabled (Supabase default)

---

## 📊 Database Schema Overview

### Core Tables (10 total)

1. **users** - User profiles (synced with Firebase Auth)
2. **companies** - Company information
3. **documents** - Document metadata
4. **document_versions** - Version history
5. **notary_requests** - Notarization workflow
6. **signatures** - Digital signatures
7. **audit_logs** - Compliance audit trail
8. **notifications** - User notifications
9. **loan_requests** - Loan application tracking
10. **verification_logs** - Identity verification logs

### Storage Structure
```
documents/
├── {user_id}/
│   ├── {timestamp}_{uuid}.pdf
│   ├── {timestamp}_{uuid}.docx
│   └── versions/
│       └── {document_id}/
│           └── {version}_{timestamp}.pdf
```

---

## 🚀 Production Deployment

### Environment Variables for Production

#### Vercel/Netlify (Frontend)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
# ... other Firebase vars
```

#### AWS/GCP/Azure (Backend)
```bash
SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from_secrets_manager>
DATABASE_URL=<supabase_connection_string>
```

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Storage bucket created
- [ ] RLS policies deployed
- [ ] API keys rotated (if exposed)
- [ ] Backup strategy configured
- [ ] Monitoring alerts set up
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring enabled

---

## 📞 Support & Resources

**Supabase Dashboard**
- Project: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq
- SQL Editor: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
- Storage: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage
- API Keys: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/settings/api

**Documentation**
- Supabase Docs: https://supabase.com/docs
- Firebase Auth Docs: https://firebase.google.com/docs/auth
- Migration Guide: See `SUPABASE_MIGRATION_GUIDE.md`

**Files to Reference**
- Database Schema: `supabase/migrations/001_initial_schema.sql`
- Storage Setup: `supabase/storage_setup.sql`
- User Service: `frontend/src/services/user-service.ts`
- Document Service: `frontend/src/services/document-service.ts`
- Backend Service: `backend/app/services/supabase_service.py`

---

## ✅ Final Verification

Before considering deployment complete:

1. **Database**
   - [ ] All 10 tables exist
   - [ ] Indexes created
   - [ ] RLS policies active
   - [ ] Can insert/query data

2. **Storage**
   - [ ] `documents` bucket exists
   - [ ] Bucket is private
   - [ ] Policies configured
   - [ ] Can upload files
   - [ ] Can generate signed URLs

3. **Authentication**
   - [ ] Firebase Auth working
   - [ ] User profiles sync to Supabase
   - [ ] OAuth flows functional
   - [ ] MFA working

4. **Integration**
   - [ ] Frontend connects to Supabase
   - [ ] Backend connects to Supabase
   - [ ] File uploads work end-to-end
   - [ ] Downloads work with signed URLs

5. **Security**
   - [ ] Service Role Key secured
   - [ ] RLS enforced
   - [ ] File validation working
   - [ ] Audit logs created

---

## 🎉 Success Criteria

You'll know the migration is successful when:

1. ✅ User can register (Firebase Auth)
2. ✅ Profile appears in Supabase `users` table
3. ✅ User can login
4. ✅ User can upload a document
5. ✅ File appears in Supabase Storage `documents` bucket
6. ✅ Metadata appears in Supabase `documents` table
7. ✅ User can download document via signed URL
8. ✅ Audit log created for each action

**Current Status**: 
- Code: ✅ 100% Complete
- Database: ⚠️ Needs SQL migration run
- Storage: ⚠️ Needs bucket creation
- Environment: ⚠️ Needs API keys configured
- Testing: ⚠️ Needs verification

**Time Estimate**: 30-45 minutes for manual configuration
