-- Database initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geolocation (optional)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schema if needed
-- CREATE SCHEMA IF NOT EXISTS notary;

-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('company', 'notary', 'bank', 'admin', 'super_admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'loan_application',
            'financial_statement',
            'tax_return',
            'bank_statement',
            'identity_proof',
            'address_proof',
            'incorporation_certificate',
            'board_resolution',
            'power_of_attorney',
            'affidavit',
            'contract',
            'agreement',
            'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM (
            'uploaded',
            'processing',
            'ocr_completed',
            'fraud_check_passed',
            'fraud_detected',
            'pending_notary',
            'notarized',
            'rejected',
            'sent_to_bank',
            'verified_by_bank',
            'archived'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notary_status') THEN
        CREATE TYPE notary_status AS ENUM (
            'pending',
            'in_review',
            'video_verification_scheduled',
            'identity_verified',
            'approved',
            'rejected',
            'completed',
            'cancelled'
        );
    END IF;
END$$;

-- Create indexes for performance (will be created by SQLAlchemy, but adding here for reference)
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
-- CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE notary_db TO notary_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO notary_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO notary_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO notary_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO notary_user;

-- Create full-text search configuration (for document search)
-- CREATE TEXT SEARCH CONFIGURATION notary_search (COPY = english);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END$$;
