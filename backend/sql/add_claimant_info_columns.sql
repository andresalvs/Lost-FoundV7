-- Migration: Add claimant information columns for found items marked as returned
-- Purpose: Store claimant student ID and phone number when a found item is marked as returned
-- Date: 2026-02-09

-- Add claimant_student_id column if it doesn't exist
ALTER TABLE items
ADD COLUMN IF NOT EXISTS claimant_student_id VARCHAR(100);

-- Add claimant_phone_number column if it doesn't exist
ALTER TABLE items
ADD COLUMN IF NOT EXISTS claimant_phone_number VARCHAR(20);

-- Comment on the columns for clarity
COMMENT ON COLUMN items.claimant_student_id IS 'Student ID of the person claiming the found item';
COMMENT ON COLUMN items.claimant_phone_number IS 'Phone number of the person claiming the found item';

-- Verify the columns were created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'items' 
  AND column_name IN ('claimant_student_id', 'claimant_phone_number')
ORDER BY ordinal_position;
