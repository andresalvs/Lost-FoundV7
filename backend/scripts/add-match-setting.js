import pool from '../db.js';

async function setup() {
  try {
    await pool.query(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('match_results_blur', 'false', 'Global flag to blur/unblur images for privacy in match results view')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Setting match_results_blur added successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding setting:', err);
    process.exit(1);
  }
}

setup();
