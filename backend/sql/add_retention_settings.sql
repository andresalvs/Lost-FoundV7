-- MIGRATION: Add retention settings for returned items
INSERT INTO system_settings (key, value, description)
VALUES ('retention_enabled', 'false', 'Enable automatic deletion of returned items after a certain period')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description)
VALUES ('retention_period', '2 months', 'The period after which returned items are automatically deleted (e.g., 2 months, 2 minutes)')
ON CONFLICT (key) DO NOTHING;
