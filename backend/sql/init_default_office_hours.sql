-- Initialize default office hours if they don't exist
-- Default configuration:
-- Saturday (6) and Sunday (0): CLOSED
-- Monday-Friday (1-5): 8:00 AM to 5:00 PM

-- First, check if records exist and insert/update accordingly
BEGIN;

-- Delete existing records to reset to defaults
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

COMMIT;

-- Verify the data
SELECT day_of_week, opening_time, closing_time, is_open FROM office_hours ORDER BY day_of_week;
