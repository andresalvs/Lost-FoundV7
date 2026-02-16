-- ============================================================================
-- MIGRATION: Fix valid_status constraint to include marked_returned
-- ============================================================================
-- The database uses "valid_status" constraint, not "items_status_check"
-- This migration updates the correct constraint

-- Step 1: Drop the existing valid_status constraint
ALTER TABLE items DROP CONSTRAINT IF EXISTS valid_status;

-- Step 2: Add new valid_status constraint with all required statuses including "marked_returned"
ALTER TABLE items ADD CONSTRAINT valid_status CHECK (
  status IN (
    'pending',
    'in_security_custody',
    'approved',
    'rejected',
    'returned',
    'marked_returned',
    'claimed',
    'confirmed_claim',
    'delivered'
  )
);

-- Verify the constraint was created
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'items' AND constraint_name = 'valid_status';
