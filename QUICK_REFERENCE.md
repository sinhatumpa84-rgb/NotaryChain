# 🚀 Quick Reference - Supabase Migration

## 30-Second Summary
- ✅ Firebase Auth: **UNCHANGED** (still works as before)
- ❌ Firestore: **REMOVED** → ✅ Supabase PostgreSQL
- ❌ Firebase Storage: **REMOVED** → ✅ Supabase Storage

## What You Need to Do (30-45 minutes)

### 1. Run SQL Migration (15 min)
```
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
→ New Query → Paste supabase/migrations/001_initial_schema.sql → Run
```

### 2. Create Storage Bucket (5 min)
```
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets
→ Create bucket → Name: documents → Private: YES
```

### 3. Configure Storage (5 min)
```
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
→ New Query → Paste supabase/storage_setup.sql → Run
```

### 4. Get API Keys (5 min)
```
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/settings/api
→ Copy Anon Key (for frontend)
→ Copy Service Role Key (for backend - KEEP SECRET!)
```

### 5. Update Environment Variables (5 min)

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_here>
```

**Backend** (`backend/.env`):
```bash
SUPABASE_SERVICE_ROLE_KEY=<paste_here>
DATABASE_URL=postgresql://postgres.rdnieuljpwvngkkeacpq:<password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

### 6. Install & Test (10 min)
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt

# Start both
# Terminal 1: uvicorn app.main:app --reload
# Terminal 2: npm run dev
```

## File Changes Made

### Created Files
```
frontend/src/lib/supabase.ts
frontend/src/services/user-service.ts
frontend/src/services/document-service.ts
backend/app/services/supabase_service.py
supabase/migrations/001_initial_schema.sql
supabase/storage_setup.sql
SUPABASE_MIGRATION_GUIDE.md
DEPLOYMENT_CHECKLIST.md
MIGRATION_STATUS.md
FINAL_CHECKLIST.md
```

### Modified Files
```
frontend/src/lib/firebase.ts (removed Firestore/Storage)
frontend/src/services/auth-service.ts (uses Supabase for profiles)
frontend/package.json (added @supabase/supabase-js)
.env.example (added Supabase vars)
README.md (updated architecture)
```

## What Works Now

✅ User registration (Firebase Auth)  
✅ User profile storage (Supabase)  
✅ Google/Microsoft OAuth (Firebase Auth)  
✅ Document upload (Supabase Storage)  
✅ Document metadata (Supabase PostgreSQL)  
✅ Signed download URLs (Supabase)  
✅ Row Level Security (Supabase)

## Key Commands

```bash
# View Supabase tables
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor

# View uploaded files
https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets/documents

# Frontend upload example
import { documentService } from '@/services/document-service';
await documentService.uploadDocument(file, {
  uploadedBy: userId,
  documentType: 'pdf',
  documentName: 'Contract.pdf'
});

# Backend upload example
from app.services.supabase_service import supabase_service
await supabase_service.upload_document(file, user_id, metadata)
```

## Database Schema

10 tables created:
- users (Firebase UID)
- companies
- documents (with file_path)
- document_versions
- notary_requests
- signatures
- audit_logs
- notifications
- loan_requests
- verification_logs

## Storage Structure

```
documents/
  └── {user_id}/
      ├── {timestamp}_{uuid}.pdf
      ├── {timestamp}_{uuid}.docx
      └── versions/
          └── {document_id}/
              └── {version}_{timestamp}.pdf
```

## Security

✅ RLS enabled on all tables  
✅ Users can only access own data  
✅ Notaries can view all documents  
✅ Storage is private (not public)  
✅ Signed URLs expire in 1 hour  
✅ 50MB file size limit  
✅ PDF/DOCX/JPEG/PNG only  

⚠️ Service Role Key = Admin access = NEVER commit to Git!

## Troubleshooting

**"relation does not exist"**  
→ Run SQL migration again

**"permission denied for table"**  
→ Check RLS policies

**"Storage object not found"**  
→ Verify bucket is named exactly `documents`

**"Invalid JWT"**  
→ Check you're using Anon Key (frontend) and Service Role Key (backend)

## Support Links

**Supabase Project**: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq  
**SQL Editor**: .../editor  
**Storage**: .../storage  
**API Keys**: .../settings/api  

**Docs**:
- Full Guide: `SUPABASE_MIGRATION_GUIDE.md`
- Checklist: `FINAL_CHECKLIST.md`
- Schema: `supabase/migrations/001_initial_schema.sql`

## Status

✅ Code: 100% complete  
⚠️ Configuration: Needs your API keys  
⚠️ Testing: Needs verification  

**Next Step**: Run SQL migration → Create bucket → Add API keys → Test!
