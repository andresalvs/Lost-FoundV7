-- Create office_hours table if it doesn't exist
CREATE TABLE IF NOT EXISTS office_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opening_time TIME NOT NULL DEFAULT '08:00:00',
  closing_time TIME NOT NULL DEFAULT '17:00:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create office_closures table if it doesn't exist
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

-- Insert default office hours if they don't exist
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
ON CONFLICT (day_of_week) DO NOTHING;

-- Verify the data
SELECT day_of_week, opening_time, closing_time, is_open FROM office_hours ORDER BY day_of_week;
