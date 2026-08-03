# Supabase Migration Guide

## Overview

This guide explains the migration from Firebase Firestore + Firebase Storage to Supabase PostgreSQL + Supabase Storage.

**What Changed:**
- ❌ Firebase Firestore → ✅ Supabase PostgreSQL
- ❌ Firebase Storage → ✅ Supabase Storage
- ✅ Firebase Authentication (UNCHANGED - still in use)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│                                                               │
│  ┌──────────────────┐  ┌────────────────┐  ┌──────────────┐│
│  │ Firebase Auth    │  │ Supabase DB    │  │ Supabase     ││
│  │ (Authentication) │  │ (User Profiles)│  │ Storage      ││
│  │                  │  │                │  │ (Documents)  ││
│  └──────────────────┘  └────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│                                                               │
│  ┌──────────────────┐  ┌────────────────┐                  │
│  │ Supabase Service │  │ Document       │                  │
│  │ (Service Role)   │  │ Processing     │                  │
│  └──────────────────┘  └────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                         │
│                                                               │
│  ┌──────────────────┐  ┌────────────────┐                  │
│  │ PostgreSQL       │  │ Storage        │                  │
│  │ (Metadata)       │  │ (Files)        │                  │
│  └──────────────────┘  └────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Supabase Project Setup

### 1.1 Access Your Supabase Project

Your project is already created:
- **URL**: https://rdnieuljpwvngkkeacpq.supabase.co
- **Region**: ap-south-1 (Mumbai)

### 1.2 Get API Keys

1. Go to https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/settings/api
2. Copy the following keys:

   **Anon (Public) Key** (for frontend):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Service Role Key** (for backend - KEEP SECRET!):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **NEVER commit the Service Role Key to Git!**

## Step 2: Database Setup

### 2.1 Run SQL Migration

1. Go to https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
2. Click "New Query"
3. Copy and paste the entire content of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" (▶️ button)
5. Wait for "Success" message

This creates:
- ✅ 10 tables (users, companies, documents, etc.)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers for timestamps
- ✅ Full-text search capabilities

### 2.2 Setup Storage Bucket

1. Go to https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets
2. Click "Create bucket"
3. Name: `documents`
4. Select: **Private**
5. Click "Create bucket"
6. Go to SQL Editor again
7. Run the content of `supabase/storage_setup.sql`

This configures:
- ✅ Private `documents` bucket
- ✅ Storage policies for user access
- ✅ 50MB max file size
- ✅ Allowed MIME types (PDF, DOCX, JPEG, PNG)

## Step 3: Environment Variables

### 3.1 Frontend (.env.local)

Update `frontend/.env.local`:

```bash
# Firebase Authentication (UNCHANGED)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=signal-scout-483d5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=signal-scout-483d5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=signal-scout-483d5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=341229184373
NEXT_PUBLIC_FIREBASE_APP_ID=1:341229184373:web:25341a5acb78b53c6a9f3c

# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.2 Backend (.env)

Update `backend/.env`:

```bash
# Supabase (NEW)
SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.rdnieuljpwvngkkeacpq:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Redis (unchanged)
REDIS_URL=redis://localhost:6379/0

# JWT (unchanged)
JWT_SECRET_KEY=your_secret_key_here
```

## Step 4: Install Dependencies

### 4.1 Frontend

```bash
cd frontend
npm install @supabase/supabase-js
```

### 4.2 Backend

```bash
cd backend
pip install supabase
```

## Step 5: Code Changes Summary

### 5.1 What Was Modified

**Frontend:**
- ✅ `frontend/src/lib/firebase.ts` - Removed Firestore & Storage imports
- ✅ `frontend/src/lib/supabase.ts` - NEW Supabase client
- ✅ `frontend/src/services/user-service.ts` - NEW User CRUD with Supabase
- ✅ `frontend/src/services/document-service.ts` - NEW Document upload/download
- ✅ `frontend/src/services/auth-service.ts` - Updated to use Supabase for profiles
- ✅ `frontend/package.json` - Added @supabase/supabase-js

**Backend:**
- ✅ `backend/app/services/supabase_service.py` - NEW Supabase service
- ✅ `backend/requirements.txt` - Already had supabase package

**Database:**
- ✅ `supabase/migrations/001_initial_schema.sql` - Complete schema
- ✅ `supabase/storage_setup.sql` - Storage bucket configuration

### 5.2 What Was NOT Changed

- ✅ Firebase Authentication (completely unchanged)
- ✅ All existing UI components
- ✅ All existing API routes structure
- ✅ Authentication middleware
- ✅ OAuth flows (Google, Microsoft)
- ✅ MFA implementation

## Step 6: Testing

### 6.1 Test User Registration

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Start frontend
cd frontend
npm run dev
```

1. Go to http://localhost:3000
2. Register a new user
3. Check Supabase Dashboard → Table Editor → users
4. You should see the new user record

### 6.2 Test Document Upload

1. Login to the app
2. Upload a document (PDF, DOCX, JPEG, or PNG)
3. Check Supabase Dashboard → Storage → documents bucket
4. Check Supabase Dashboard → Table Editor → documents
5. Verify file and metadata are present

### 6.3 Test Signed URLs

```javascript
// In your frontend code
import { documentService } from '@/services/document-service';

const result = await documentService.getSignedDownloadUrl(documentId);
console.log('Signed URL:', result.signedUrl);
// URL expires in 1 hour by default
```

## Step 7: Data Migration (If Needed)

If you have existing Firestore data to migrate:

### 7.1 Export from Firestore

```javascript
// Run this script in Firebase Console or locally
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp();
const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${data.length} documents from ${collectionName}`);
}

exportCollection('users');
exportCollection('documents');
```

### 7.2 Import to Supabase

```python
# Run this script with Python
import json
from supabase import create_client

supabase = create_client(
    "https://rdnieuljpwvngkkeacpq.supabase.co",
    "your_service_role_key"
)

# Import users
with open('users.json', 'r') as f:
    users = json.load(f)
    for user in users:
        # Map Firestore fields to Supabase schema
        supabase.table('users').insert({
            'id': user['uid'],
            'email': user['email'],
            'first_name': user['firstName'],
            'last_name': user['lastName'],
            'full_name': user['fullName'],
            # ... map other fields
        }).execute()

print(f"Imported {len(users)} users")
```

## Step 8: Row Level Security (RLS)

RLS policies are already configured in the migration script. Here's what they do:

### Users Table
- ✅ Users can view all profiles (needed for notary matching)
- ✅ Users can only update their own profile
- ✅ Admins can update any profile

### Documents Table
- ✅ Users can view own documents
- ✅ Notaries and admins can view all documents
- ✅ Users can upload to own account
- ✅ Users can update own documents

### Notifications Table
- ✅ Users can only see their own notifications
- ✅ Users can mark their notifications as read

### Audit Logs Table
- ✅ Only admins can view audit logs
- ✅ Logs are immutable (no update/delete)

## Step 9: Verification Checklist

Run through this checklist:

- [ ] Supabase project accessible
- [ ] Database schema created (10 tables)
- [ ] Storage bucket created (`documents`)
- [ ] Storage policies configured
- [ ] Frontend env variables updated
- [ ] Backend env variables updated
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Can register new user
- [ ] User profile appears in Supabase
- [ ] Can login with Firebase Auth
- [ ] Can upload document
- [ ] Document appears in Storage
- [ ] Document metadata in database
- [ ] Can download document with signed URL
- [ ] RLS policies working correctly

## Step 10: Production Deployment

### 10.1 Supabase Production

Your Supabase project is already in production mode:
- ✅ Automatic backups enabled
- ✅ SSL/TLS encryption
- ✅ Edge functions ready
- ✅ Real-time subscriptions available

### 10.2 Environment Variables (Production)

**Frontend (Vercel/Netlify):**
```
NEXT_PUBLIC_SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
# ... other Firebase vars
```

**Backend (local or VM):**
```
SUPABASE_URL=https://rdnieuljpwvngkkeacpq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DATABASE_URL=<supabase_connection_string>
```

### 10.3 Security Best Practices

1. **Never expose Service Role Key**
   - Only use in backend
   - Store in secrets manager (AWS Secrets, GCP Secret Manager)
   - Never commit to Git

2. **Enable Additional Security**
   ```sql
   -- Enable audit logging
   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
   
   -- Restrict admin actions
   CREATE POLICY "Only super admins can delete users"
   ON users FOR DELETE
   USING (
     EXISTS (
       SELECT 1 FROM users 
       WHERE id = auth.uid()::text 
       AND role = 'super_admin'
     )
   );
   ```

3. **Monitor Usage**
   - Set up Supabase alerts for:
     - Storage quota (80% threshold)
     - Database size (80% threshold)
     - Bandwidth usage

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run the migration SQL script again

### Issue: "permission denied for table"
**Solution**: Check RLS policies are correctly configured

### Issue: "Storage object not found"
**Solution**: Verify bucket name is exactly `documents`

### Issue: "Invalid JWT"
**Solution**: Ensure you're using the correct Anon key for frontend and Service Role key for backend

### Issue: "File upload fails"
**Solution**: 
1. Check file size < 50MB
2. Verify MIME type is allowed
3. Check storage bucket exists and is accessible

## Support

- Supabase Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq
- SQL Editor: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
- Storage: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets

## Summary

✅ **Completed:**
- Firebase Auth remains unchanged
- Firestore replaced with Supabase PostgreSQL
- Firebase Storage replaced with Supabase Storage
- All services updated
- Database schema created
- Storage bucket configured
- RLS policies implemented
- Migration scripts ready

⚠️ **Manual Steps Required:**
1. Run SQL migrations in Supabase dashboard
2. Create storage bucket
3. Configure storage policies
4. Update environment variables with real keys
5. Install npm/pip dependencies
6. Test user registration and document upload

🎉 **Result:**
Your Digital Notary Platform now uses Supabase for data and storage while keeping Firebase Authentication intact!
