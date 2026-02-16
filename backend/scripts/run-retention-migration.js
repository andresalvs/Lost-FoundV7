import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
import pool from '../db.js';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    const sqlFile = path.join(process.cwd(), 'backend/sql/add_retention_settings.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✅ Migration completed: Retention settings added to system_settings');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  }
};

runMigration();
