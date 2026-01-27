import pool from '../db.js';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    const sqlFile = path.join(process.cwd(), 'backend/sql/add_id_number_column.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✅ Migration completed: id_number column added to users table');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.message.includes('already exists')) {
      console.log('ℹ️ Column already exists, skipping migration');
      await pool.end();
      process.exit(0);
    }
    await pool.end();
    process.exit(1);
  }
};

runMigration();
