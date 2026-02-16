-- ============================================================================
-- MIGRATION: Add claimant_name column to items table
-- ============================================================================
-- This adds a claimant_name column to store the name of the person who
-- received a found item when staff marks it as returned

-- Add the claimant_name column (TEXT type to store full names)
ALTER TABLE items ADD COLUMN IF NOT EXISTS claimant_name TEXT;

-- Set default to NULL for existing records
UPDATE items SET claimant_name = NULL WHERE claimant_name IS NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'claimant_name';
