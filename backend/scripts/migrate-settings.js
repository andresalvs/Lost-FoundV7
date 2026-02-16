import pool from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrateSettings = async () => {
  try {
    const sqlFile = path.join(__dirname, '../sql/create_system_settings.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }
    
    console.log('✅ System settings table created and seeded!');
    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    await pool.end();
  }
};

migrateSettings();
