-- ============================================================================
-- MIGRATION: Add "marked_returned" status to items table
-- ============================================================================
-- This adds the new "marked_returned" status for lost items manually marked
-- as returned by staff, distinct from the "returned" status used by found items

-- Step 1: Drop the existing CHECK constraint on status
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;

-- Step 2: Add new CHECK constraint with "marked_returned" included
ALTER TABLE items ADD CONSTRAINT items_status_check 
  CHECK (status IN ('pending', 'in_security_custody', 'approved', 'rejected', 'returned', 'marked_returned', 'claimed', 'confirmed_claim', 'delivered'));

-- Step 3: Verify the constraint was added
SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
WHERE table_name = 'items' AND constraint_name = 'items_status_check';
