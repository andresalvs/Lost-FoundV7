-- Migration: Add status and accepted_at columns to items table for auto-acceptance feature

-- Add status column if it doesn't exist
ALTER TABLE items
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
CHECK (status IN ('pending', 'in_security_custody', 'approved', 'rejected', 'returned'));

-- Add accepted_at column if it doesn't exist (for tracking when item was accepted)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- Create index on accepted_at for sorting
CREATE INDEX IF NOT EXISTS idx_items_accepted_at ON items(accepted_at);

-- Optional: Update existing 'pending' items to have status='pending' explicitly
UPDATE items SET status = 'pending' WHERE status IS NULL OR status = '';

COMMIT;
