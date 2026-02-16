-- Create system_settings table for global application configuration
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed the initial privacy_blur value
INSERT INTO system_settings (key, value, description)
VALUES ('privacy_blur', 'false', 'Global flag to blur/unblur images for privacy in search results')
ON CONFLICT (key) DO NOTHING;
