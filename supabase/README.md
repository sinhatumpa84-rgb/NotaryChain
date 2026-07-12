# Supabase Database & Storage Setup

This directory contains SQL migration files for the Digital Notary Platform's Supabase database and storage configuration.

## Files

### 1. `001_initial_schema.sql`
**Purpose**: Create the complete PostgreSQL database schema  
**Lines**: 479  
**Contains**:
- 10 tables with relationships
- 20+ indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updating timestamps
- Full-text search configuration
- Comments and documentation

**Tables Created**:
1. `users` - User profiles (Firebase UID as primary key)
2. `companies` - Company information
3. `documents` - Document metadata with Supabase Storage references
4. `document_versions` - Document version history
5. `notary_requests` - Notarization workflow
6. `signatures` - Digital signatures and certificates
7. `audit_logs` - Immutable audit trail
8. `notifications` - User notifications
9. `loan_requests` - Loan application tracking
10. `verification_logs` - Identity verification logs

### 2. `storage_setup.sql`
**Purpose**: Configure Supabase Storage bucket and policies  
**Lines**: 60  
**Contains**:
- Private `documents` bucket creation
- Storage RLS policies
- File size limits (50MB)
- MIME type restrictions (PDF, DOCX, JPEG, PNG)

## How to Use

### Step 1: Run Database Migration

1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
   ```

2. Click **"New Query"**

3. Copy the entire content of `001_initial_schema.sql`

4. Paste into the SQL Editor

5. Click **"Run"** (▶️ button)

6. Wait for **"Success"** message

7. Verify tables created:
   - Go to **Table Editor**
   - You should see 10 tables

### Step 2: Create Storage Bucket

1. Go to Supabase Storage:
   ```
   https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage/buckets
   ```

2. Click **"Create bucket"**

3. Enter bucket name: `documents`

4. Select: **Private** (do not make public)

5. Click **"Create bucket"**

### Step 3: Configure Storage Policies

1. Go back to SQL Editor:
   ```
   https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
   ```

2. Click **"New Query"**

3. Copy the entire content of `storage_setup.sql`

4. Paste into the SQL Editor

5. Click **"Run"** (▶️ button)

6. Verify storage policies:
   - Go to **Storage** → **Policies**
   - You should see bucket policies

## Database Schema Overview

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Firebase UID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,               -- company|notary|bank|admin|super_admin
  photo_url TEXT,
  is_email_verified BOOLEAN,
  is_phone_verified BOOLEAN,
  is_identity_verified BOOLEAN,
  is_active BOOLEAN,
  is_approved BOOLEAN,
  mfa_enabled BOOLEAN,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_number TEXT,
  file_url TEXT NOT NULL,           -- Supabase Storage public URL
  file_path TEXT NOT NULL,          -- Supabase Storage path
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  status TEXT NOT NULL,             -- uploaded|verified|notarized|rejected
  ocr_text TEXT,                    -- OCR extracted text
  fraud_score NUMERIC(5,2),         -- 0.00 to 100.00
  is_encrypted BOOLEAN,
  is_signed BOOLEAN,
  qr_code_url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL,
  notarized_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Users
- Users can view all profiles (for notary matching)
- Users can only update their own profile
- Admins can update any profile

### Documents
- Users can view own documents
- Notaries and admins can view all documents
- Users can upload documents
- Users can update own documents

### Storage
- Users can upload files to own folder (`{user_id}/`)
- Users can view own files
- Notaries and admins can view all files
- Users can delete own files

## Storage Structure

```
documents/
├── {user_id}/
│   ├── {timestamp}_{uuid}.pdf
│   ├── {timestamp}_{uuid}.docx
│   ├── {timestamp}_{uuid}.jpg
│   └── versions/
│       └── {document_id}/
│           ├── 1_{timestamp}.pdf
│           └── 2_{timestamp}.pdf
```

## File Validation

### Allowed MIME Types
- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `image/jpeg`
- `image/png`

### File Size Limit
- **Maximum**: 50 MB (52,428,800 bytes)

## Indexes

Performance indexes created:
- `idx_users_email` - User email lookup
- `idx_users_role` - Filter by role
- `idx_users_full_name` - Full-text search on names
- `idx_documents_uploaded_by` - User's documents
- `idx_documents_company` - Company documents
- `idx_documents_status` - Filter by status
- `idx_documents_ocr_text` - Full-text search on OCR text
- And 15+ more indexes...

## Triggers

Auto-updating `updated_at` timestamp on:
- `users`
- `companies`
- `documents`
- `notary_requests`
- `loan_requests`

## Testing the Schema

After running the migrations:

### Test 1: Insert User
```sql
INSERT INTO users (id, email, first_name, last_name, full_name, role)
VALUES ('firebase_uid_123', 'test@example.com', 'John', 'Doe', 'John Doe', 'company');
```

### Test 2: Query Documents
```sql
SELECT * FROM documents WHERE uploaded_by = 'firebase_uid_123';
```

### Test 3: Check RLS
```sql
-- This should only return documents for the current user
SELECT * FROM documents WHERE uploaded_by = auth.uid()::text;
```

## Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already created. Skip or drop tables first.

### Error: "permission denied for table"
**Solution**: Check RLS policies are correctly configured.

### Error: "function uuid_generate_v4() does not exist"
**Solution**: Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Storage bucket not found
**Solution**: Verify bucket is named exactly `documents` (lowercase).

### Storage policies not working
**Solution**: Re-run `storage_setup.sql` to recreate policies.

## Rollback (If Needed)

To remove everything:

```sql
-- Drop tables (in order due to foreign keys)
DROP TABLE IF EXISTS verification_logs CASCADE;
DROP TABLE IF EXISTS loan_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS notary_requests CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

To remove storage bucket:
1. Go to Storage → Buckets
2. Click on `documents` bucket
3. Click **"Delete bucket"**

## Next Steps

After running these migrations:

1. ✓ Database schema deployed
2. ✓ Storage bucket created
3. ⚠ Update environment variables with API keys
4. ⚠ Install frontend/backend dependencies
5. ⚠ Test user registration
6. ⚠ Test document upload

See `DEPLOYMENT_CHECKLIST.md` for complete steps.

## Support

- **Supabase Dashboard**: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq
- **SQL Editor**: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
- **Table Editor**: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/editor
- **Storage**: https://supabase.com/dashboard/project/rdnieuljpwvngkkeacpq/storage
- **Documentation**: See `SUPABASE_MIGRATION_GUIDE.md` in project root
