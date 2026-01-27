-- Add id_number column to users table (only if it doesn't exist)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS id_number VARCHAR(50);

-- Create index for faster lookups (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_users_id_number ON users(id_number);

