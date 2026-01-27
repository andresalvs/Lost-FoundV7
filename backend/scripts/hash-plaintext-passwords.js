import pool from '../db.js';
import bcrypt from 'bcrypt';

// This script finds users whose password_hash doesn't look like a bcrypt hash
// (i.e. doesn't start with $2a$ / $2b$ / $2y$), and replaces the value with a bcrypt hash.
// Usage: node backend/scripts/hash-plaintext-passwords.js

async function run() {
  try {
    const res = await pool.query("SELECT id, email, password_hash FROM users WHERE password_hash IS NOT NULL");
    console.log(`Found ${res.rowCount} users with non-null password_hash`);

    for (const row of res.rows) {
      const raw = row.password_hash || '';
      // Simple heuristic: bcrypt hashes usually start with $2a$ or $2b$ or $2y$
      if (/^\$2[aby]\$/.test(raw)) {
        console.log(`Skipping already-hashed password for ${row.email}`);
        continue;
      }

      if (!raw || raw.trim() === '') {
        console.log(`Skipping empty password for ${row.email}`);
        continue;
      }

      console.log(`Hashing password for ${row.email} (id=${row.id})`);
      const hashed = await bcrypt.hash(raw, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, row.id]);
      console.log(`Updated password_hash for ${row.email}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error hashing passwords:', err);
    process.exit(1);
  }
}

run();
