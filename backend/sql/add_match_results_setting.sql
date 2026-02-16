-- Add match_results_blur setting to system_settings table
INSERT INTO system_settings (key, value, description)
VALUES ('match_results_blur', 'false', 'Global flag to blur/unblur images for privacy in match results view')
ON CONFLICT (key) DO NOTHING;
