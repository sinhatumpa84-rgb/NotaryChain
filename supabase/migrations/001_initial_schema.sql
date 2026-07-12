-- Digital Notary Platform - Initial Schema
-- Supabase PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Firebase UID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('company', 'notary', 'bank', 'admin', 'super_admin')),
  photo_url TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_full_name ON users USING gin(full_name gin_trgm_ops);

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('private_limited', 'public_limited', 'llp', 'partnership', 'sole_proprietorship', 'opc', 'ngo', 'trust', 'cooperative')),
  registration_number TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  address JSONB NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  directors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for companies
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_name ON companies USING gin(company_name gin_trgm_ops);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_number TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'ocr_processing', 'ocr_complete', 'fraud_check', 'pending_verification', 'verified', 'notarized', 'rejected', 'expired')),
  ocr_text TEXT,
  fraud_score NUMERIC(5,2),
  is_encrypted BOOLEAN DEFAULT FALSE,
  is_signed BOOLEAN DEFAULT FALSE,
  qr_code_url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL,
  notarized_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_name ON documents USING gin(document_name gin_trgm_ops);

-- ============================================================================
-- DOCUMENT VERSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  changes_description TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Indexes for document versions
CREATE INDEX idx_document_versions_document ON document_versions(document_id);

-- ============================================================================
-- NOTARY REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notary_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notary_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  request_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'identity_verification', 'video_verification', 'approved', 'rejected', 'completed', 'cancelled')),
  identity_verified BOOLEAN DEFAULT FALSE,
  face_match_score NUMERIC(5,2),
  liveness_check_passed BOOLEAN,
  rejection_reason TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notary requests
CREATE INDEX idx_notary_requests_requested_by ON notary_requests(requested_by);
CREATE INDEX idx_notary_requests_notary ON notary_requests(notary_id);
CREATE INDEX idx_notary_requests_document ON notary_requests(document_id);
CREATE INDEX idx_notary_requests_status ON notary_requests(status);

-- ============================================================================
-- SIGNATURES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  notary_request_id UUID REFERENCES notary_requests(id) ON DELETE SET NULL,
  signer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signature_type TEXT NOT NULL CHECK (signature_type IN ('digital', 'electronic', 'notary_seal')),
  signature_data TEXT NOT NULL, -- Base64 encoded signature or certificate
  certificate_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for signatures
CREATE INDEX idx_signatures_document ON signatures(document_id);
CREATE INDEX idx_signatures_signer ON signatures(signer_id);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- LOAN REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS loan_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  loan_amount NUMERIC(15,2) NOT NULL,
  loan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed')),
  submitted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  documents TEXT[] DEFAULT '{}', -- Array of document IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for loan requests
CREATE INDEX idx_loan_requests_company ON loan_requests(company_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);

-- ============================================================================
-- VERIFICATION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('email', 'phone', 'face', 'aadhaar', 'pan', 'passport', 'liveness')),
  verification_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failure')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for verification logs
CREATE INDEX idx_verification_logs_user ON verification_logs(user_id);
CREATE INDEX idx_verification_logs_type ON verification_logs(verification_type);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notary_requests_updated_at BEFORE UPDATE ON notary_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_requests_updated_at BEFORE UPDATE ON loan_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notary_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- Authenticated users can view profiles

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Companies policies
CREATE POLICY "Companies are viewable by members" ON companies
  FOR SELECT USING (true); -- Authenticated users can view companies

CREATE POLICY "Company owners can update" ON companies
  FOR UPDATE USING (auth.uid()::text = owner_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (
    auth.uid()::text = uploaded_by OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('notary', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (
    auth.uid()::text = uploaded_by OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('notary', 'admin', 'super_admin')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Audit logs policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search index on documents
CREATE INDEX idx_documents_ocr_text ON documents USING gin(to_tsvector('english', COALESCE(ocr_text, '')));

-- Composite indexes
CREATE INDEX idx_documents_user_status ON documents(uploaded_by, status);
CREATE INDEX idx_notary_requests_status_created ON notary_requests(status, created_at DESC);
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add initial data here if needed
-- For example, creating a super admin user (after Firebase creates the auth user)

COMMENT ON TABLE users IS 'User profiles synced with Firebase Authentication';
COMMENT ON TABLE documents IS 'Document metadata with Supabase Storage references';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance';
