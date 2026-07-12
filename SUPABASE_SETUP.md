# Supabase Setup Guide for Digital Notary Platform

This guide explains how to set up Supabase for the Digital Notary Platform, providing enterprise-grade authentication, database, and storage.

## Why Supabase?

Supabase provides:
- **Built-in Authentication**: Email/password, OAuth (Google, Microsoft, GitHub), MFA, phone/email OTP
- **Real-time Database**: PostgreSQL with real-time subscriptions
- **Row Level Security (RLS)**: Database-level security policies
- **Storage**: S3-compatible object storage with access control
- **Auto-generated APIs**: RESTful and GraphQL APIs
- **Database Migrations**: Version control for schema changes
- **Edge Functions**: Serverless functions

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization
4. Create a new project:
   - Project name: `digital-notary-platform`
   - Database password: Generate a strong password
   - Region: Choose closest to your users
   - Pricing plan: Start with Free tier, upgrade to Pro for production

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon (public) key**: For client-side operations
   - **Service role key**: For server-side admin operations

3. Add to `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 3. Database Schema

Create the following tables in Supabase SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.user_profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    phone text,
    first_name text not null,
    last_name text not null,
    role text not null check (role in ('company', 'notary', 'bank', 'admin', 'super_admin')),
    avatar_url text,
    
    -- Verification
    is_email_verified boolean default false,
    is_phone_verified boolean default false,
    is_identity_verified boolean default false,
    is_active boolean default true,
    is_approved boolean default false,
    
    -- KYC
    aadhaar_number text,
    pan_number text,
    passport_number text,
    face_encoding text,
    
    -- Security
    mfa_enabled boolean default false,
    failed_login_attempts integer default 0,
    last_login_at timestamp with time zone,
    last_login_ip text,
    device_fingerprint text,
    
    -- OAuth
    google_id text unique,
    microsoft_id text unique,
    
    -- Notary specific
    notary_license_number text,
    notary_license_state text,
    notary_license_expiry timestamp with time zone,
    
    -- Bank specific
    organization_name text,
    organization_id text,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- Companies table
create table public.companies (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid references auth.users on delete cascade not null,
    company_name text not null,
    company_type text not null,
    registration_number text unique not null,
    tax_id text,
    
    -- Address
    address_line1 text not null,
    address_line2 text,
    city text not null,
    state text not null,
    postal_code text not null,
    country text not null default 'India',
    
    -- Contact
    email text not null,
    phone text not null,
    website text,
    
    -- Directors
    directors jsonb default '[]'::jsonb,
    
    -- Documents
    incorporation_certificate_url text,
    tax_certificate_url text,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- Documents table
create table public.documents (
    id uuid default uuid_generate_v4() primary key,
    uploaded_by uuid references auth.users on delete cascade not null,
    company_id uuid references public.companies on delete cascade,
    
    -- Document info
    document_type text not null,
    document_name text not null,
    document_number text unique not null,
    
    -- File info
    original_filename text not null,
    file_url text not null,
    encrypted_file_url text,
    thumbnail_url text,
    file_size integer not null,
    mime_type text not null,
    file_extension text not null,
    
    -- Security
    file_hash text not null unique,
    blockchain_hash text,
    encryption_key_id text,
    is_encrypted boolean default false,
    
    -- Watermark
    has_watermark boolean default false,
    watermark_text text,
    
    -- Status
    status text not null default 'uploaded',
    
    -- OCR
    ocr_text text,
    ocr_confidence real,
    ocr_completed_at timestamp with time zone,
    extracted_data jsonb default '{}'::jsonb,
    
    -- Fraud detection
    fraud_score real,
    fraud_flags jsonb default '[]'::jsonb,
    fraud_check_completed_at timestamp with time zone,
    is_tampered boolean default false,
    tampering_details jsonb,
    
    -- AI analysis
    ai_summary text,
    ai_risk_assessment text,
    ai_recommendations jsonb,
    
    -- Digital signature
    is_signed boolean default false,
    signature_data jsonb,
    signature_certificate text,
    signed_at timestamp with time zone,
    signed_by uuid references auth.users,
    
    -- QR code
    qr_code_url text,
    qr_code_data text,
    
    -- Version control
    version integer default 1,
    parent_document_id uuid references public.documents,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    tags jsonb default '[]'::jsonb,
    
    -- Timestamps
    uploaded_at timestamp with time zone default now(),
    processed_at timestamp with time zone,
    notarized_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- Notary requests table
create table public.notary_requests (
    id uuid default uuid_generate_v4() primary key,
    requested_by uuid references auth.users on delete cascade not null,
    company_id uuid references public.companies,
    notary_id uuid references auth.users,
    document_id uuid references public.documents not null,
    
    -- Request info
    request_number text unique not null,
    request_type text not null,
    status text not null default 'pending',
    priority text default 'normal',
    
    -- Verification
    identity_verified boolean default false,
    face_match_score real,
    liveness_check_passed boolean default false,
    liveness_check_score real,
    
    -- Video verification
    video_verification_required boolean default false,
    video_call_url text,
    video_recording_url text,
    video_verification_at timestamp with time zone,
    
    -- Supporting documents
    supporting_documents jsonb default '[]'::jsonb,
    
    -- Notary actions
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejection_reason text,
    
    -- Notes
    notary_notes text,
    internal_notes text,
    
    -- Digital seal
    notary_seal_applied boolean default false,
    notary_seal_url text,
    notary_seal_timestamp timestamp with time zone,
    
    -- Certificate
    certificate_issued_at timestamp with time zone,
    
    -- Bank submission
    sent_to_bank boolean default false,
    bank_id uuid references auth.users,
    sent_to_bank_at timestamp with time zone,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- Notary certificates table
create table public.notary_certificates (
    id uuid default uuid_generate_v4() primary key,
    notary_request_id uuid references public.notary_requests not null,
    document_id uuid references public.documents not null,
    notary_id uuid references auth.users not null,
    issued_to uuid references auth.users not null,
    
    -- Certificate info
    certificate_number text unique not null,
    certificate_type text not null,
    
    -- Content
    certificate_text text not null,
    certificate_pdf_url text not null,
    
    -- Digital signature
    digital_signature text not null,
    signature_algorithm text not null,
    public_key text not null,
    
    -- QR code
    qr_code_url text not null,
    qr_code_data text not null,
    verification_url text not null,
    
    -- Blockchain
    blockchain_hash text,
    blockchain_verified boolean default false,
    
    -- Validity
    issued_at timestamp with time zone default now(),
    expires_at timestamp with time zone,
    is_revoked boolean default false,
    revoked_at timestamp with time zone,
    revocation_reason text,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Audit logs table
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    
    -- Action
    action text not null,
    action_description text not null,
    resource_type text,
    resource_id text,
    
    -- User
    user_id uuid references auth.users,
    user_email text,
    user_role text,
    
    -- Request
    ip_address inet,
    user_agent text,
    request_method text,
    request_path text,
    request_id text,
    
    -- Device
    device_fingerprint text,
    device_type text,
    browser text,
    os text,
    
    -- Location
    country text,
    city text,
    latitude text,
    longitude text,
    
    -- Status
    status text not null,
    status_code integer,
    error_message text,
    
    -- Changes
    old_values jsonb,
    new_values jsonb,
    
    -- Additional data
    metadata jsonb default '{}'::jsonb,
    
    -- Blockchain
    blockchain_hash text,
    blockchain_verified boolean default false,
    
    -- Duration
    duration_ms integer,
    
    -- Timestamp
    created_at timestamp with time zone default now()
);

-- Notifications table
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    
    -- Notification details
    type text not null,
    title text not null,
    message text not null,
    priority text default 'normal',
    
    -- Status
    is_read boolean default false,
    read_at timestamp with time zone,
    
    -- Delivery channels
    sent_via_email boolean default false,
    sent_via_sms boolean default false,
    sent_via_whatsapp boolean default false,
    sent_via_push boolean default false,
    sent_via_in_app boolean default true,
    
    -- Related resources
    resource_type text,
    resource_id text,
    action_url text,
    
    -- Metadata
    metadata jsonb default '{}'::jsonb,
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    sent_at timestamp with time zone,
    expires_at timestamp with time zone
);

-- Create indexes
create index idx_user_profiles_email on public.user_profiles(email);
create index idx_user_profiles_role on public.user_profiles(role);
create index idx_documents_status on public.documents(status);
create index idx_documents_uploaded_by on public.documents(uploaded_by);
create index idx_notary_requests_status on public.notary_requests(status);
create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_created_at on public.audit_logs(created_at);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.documents enable row level security;
alter table public.notary_requests enable row level security;
alter table public.notary_certificates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies (examples - customize as needed)

-- User profiles: users can read their own profile, admins can read all
create policy "Users can view own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.user_profiles for update
    using (auth.uid() = id);

-- Documents: users can see documents they uploaded or are related to
create policy "Users can view own documents"
    on public.documents for select
    using (auth.uid() = uploaded_by or auth.uid() in (
        select notary_id from public.notary_requests where document_id = documents.id
    ));

-- Audit logs: only admins can view
create policy "Only admins can view audit logs"
    on public.audit_logs for select
    using (exists (
        select 1 from public.user_profiles
        where id = auth.uid() and role in ('admin', 'super_admin')
    ));

-- Notifications: users can only see their own
create policy "Users can view own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "Users can update own notifications"
    on public.notifications for update
    using (auth.uid() = user_id);
```

### 4. Enable Authentication Providers

1. Go to Authentication → Providers
2. Enable providers:
   - **Email**: Already enabled by default
   - **Google**: Add OAuth credentials
   - **Microsoft**: Add OAuth credentials
   - **Phone**: Configure Twilio/MessageBird

#### Google OAuth Setup:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

#### Microsoft OAuth Setup:
1. Go to Azure Portal
2. Register application
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Application ID and Secret to Supabase

### 5. Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize templates for:
   - Confirm signup
   - Magic link
   - Reset password
   - Change email

### 6. Set Up Storage Buckets

```sql
-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
    ('documents', 'documents', false),
    ('avatars', 'avatars', true),
    ('certificates', 'certificates', false);

-- Storage policies
create policy "Authenticated users can upload documents"
    on storage.objects for insert
    with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can view own documents"
    on storage.objects for select
    using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view avatars"
    on storage.objects for select
    using (bucket_id = 'avatars');
```

### 7. Environment Variables

Update your `.env` file:
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Database (Supabase provides this)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### 8. Testing

Test authentication:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Check status
supabase db remote status
```

## Features Provided by Supabase

### ✅ Authentication
- Email/password with email verification
- OAuth (Google, Microsoft, GitHub, etc.)
- Magic links
- Phone/SMS OTP
- Multi-factor authentication (TOTP)
- Session management
- Password reset

### ✅ Database
- PostgreSQL with full SQL support
- Real-time subscriptions
- Row Level Security (RLS)
- Database functions and triggers
- Automatic API generation

### ✅ Storage
- S3-compatible object storage
- Access control policies
- Image transformations
- CDN distribution

### ✅ Security
- Row Level Security at database level
- JWT-based authentication
- API key management
- Rate limiting
- DDoS protection

### ✅ Monitoring
- Database metrics
- API usage analytics
- Real-time logs
- Performance insights

## Migration from Custom Auth

If migrating from the custom JWT implementation:

1. **User Data**: Export users and import to Supabase
2. **Sessions**: Clear existing sessions, users will re-login
3. **Tokens**: Replace custom JWT with Supabase tokens
4. **OAuth**: Update OAuth callbacks to Supabase endpoints
5. **MFA**: Re-enroll users in Supabase MFA

## Production Checklist

- [ ] Upgrade to Pro plan for production use
- [ ] Enable database backups (automatic with Pro)
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Review and test RLS policies
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up CDN for assets
- [ ] Test disaster recovery procedures
- [ ] Document all custom policies

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
