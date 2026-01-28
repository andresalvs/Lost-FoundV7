-- ============================================================================
-- LOST AND FOUND V5 - COMPLETE DATABASE SETUP SCRIPT
-- ============================================================================
-- Copy and paste this entire script into pgAdmin or your PostgreSQL client
-- This includes all tables, indexes, and migrations needed for the new database
-- ============================================================================

-- ============================================================================
-- 1. CREATE MAIN TABLES (These should already exist in your database)
-- ============================================================================
-- NOTE: If these tables already exist, skip this section
-- These are the core application tables

-- Users table (basic structure - may already exist)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('university_member', 'admin', 'security')),
  full_name VARCHAR(255),
  contact_number VARCHAR(20),
  department VARCHAR(100),
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT false,
  id_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items table (basic structure - may already exist)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  type VARCHAR(50) CHECK (type IN ('lost', 'found')),
  category VARCHAR(50) CHECK (category IN ('general', 'id')),
  brand VARCHAR(100),
  color VARCHAR(100),
  description TEXT,
  location VARCHAR(255),
  datetime TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_security_custody', 'approved', 'rejected', 'returned')),
  image_url TEXT,
  student_id VARCHAR(50),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course VARCHAR(100),
  department VARCHAR(100),
  cover TEXT,
  accepted_at TIMESTAMPTZ,
  claimant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_claim_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table (basic structure - may already exist)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  confidence NUMERIC(5, 2) DEFAULT 100.0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lost_item_id, found_item_id)
);

-- Notifications table (basic structure - may already exist)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  type VARCHAR(100),
  category VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  cleared_at TIMESTAMP
);

-- Claims table (basic structure - may already exist)
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  claimant_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pending registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. ADD COLUMNS TO EXISTING TABLES (Migrations)
-- ============================================================================

-- Add status and accepted_at columns to items table if they don't exist
ALTER TABLE items
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
CHECK (status IN ('pending', 'in_security_custody', 'approved', 'rejected', 'returned'));

ALTER TABLE items
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Add id_number column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS id_number VARCHAR(50);

-- Add user_id column to claims table if it doesn't exist
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add claimant_message column to claims table if it doesn't exist
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS claimant_message TEXT;

-- Add cleared_at column to notifications table if it doesn't exist
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

-- ============================================================================
-- 3. CREATE OFFICE HOURS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opening_time TIME NOT NULL DEFAULT '08:00:00',
  closing_time TIME NOT NULL DEFAULT '17:00:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS office_closures (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  closure_date DATE NOT NULL,
  closure_start_time TIME,
  closure_end_time TIME,
  is_all_day BOOLEAN NOT NULL DEFAULT true,
  reason VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(closure_date, event_name)
);

-- ============================================================================
-- 4. INSERT DEFAULT OFFICE HOURS
-- ============================================================================

-- Delete existing records to reset to defaults (optional - comment out if you want to preserve)
DELETE FROM office_hours;

-- Insert default hours
INSERT INTO office_hours (day_of_week, opening_time, closing_time, is_open, created_at, updated_at)
VALUES
  -- Sunday (0) - CLOSED
  (0, '08:00:00', '17:00:00', false, NOW(), NOW()),
  -- Monday (1) - 8 AM to 5 PM
  (1, '08:00:00', '17:00:00', true, NOW(), NOW()),
  -- Tuesday (2) - 8 AM to 5 PM
  (2, '08:00:00', '17:00:00', true, NOW(), NOW()),
  -- Wednesday (3) - 8 AM to 5 PM
  (3, '08:00:00', '17:00:00', true, NOW(), NOW()),
  -- Thursday (4) - 8 AM to 5 PM
  (4, '08:00:00', '17:00:00', true, NOW(), NOW()),
  -- Friday (5) - 8 AM to 5 PM
  (5, '08:00:00', '17:00:00', true, NOW(), NOW()),
  -- Saturday (6) - CLOSED
  (6, '08:00:00', '17:00:00', false, NOW(), NOW())
ON CONFLICT (day_of_week) DO UPDATE
SET
  opening_time = EXCLUDED.opening_time,
  closing_time = EXCLUDED.closing_time,
  is_open = EXCLUDED.is_open,
  updated_at = NOW();

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_accepted_at ON items(accepted_at);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_reporter_id ON items(reporter_id);
CREATE INDEX IF NOT EXISTS idx_items_student_id ON items(student_id);

-- Claims indexes
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_item_id_created_at ON public.claims(item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_user_id_created_at ON public.claims(user_id, created_at DESC);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_lost_item_id ON matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item_id ON matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_item_id ON notifications(item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_match_id ON notifications(match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_id_number ON users(id_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 6. VERIFY SETUP
-- ============================================================================

-- Check that all main tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'items', 'matches', 'notifications', 'claims', 'office_hours', 'office_closures', 'pending_registrations')
ORDER BY table_name;

-- Check office hours data
SELECT day_of_week, opening_time, closing_time, is_open FROM office_hours ORDER BY day_of_week;

-- ============================================================================
-- PGVECTOR SETUP - SEMANTIC SEARCH FOR ITEMS
-- ============================================================================
-- These commands enable vector-based semantic search for general items
-- Required for the pgvector-enhanced search functionality

-- Create pgvector extension (enables vector data type)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to items table for semantic search
-- Stores 384-dimensional embeddings from all-MiniLM-L6-v2 model
ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create index for faster vector similarity search using IVFFLAT
-- This significantly speeds up semantic searches on large item lists
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON items USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Verify pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verify embedding column was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'embedding';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- All database tables, indexes, and default data have been created.
-- pgvector extension is now enabled for semantic item search.
-- The database is now ready for the Lost and Found V5 application.
-- ============================================================================
