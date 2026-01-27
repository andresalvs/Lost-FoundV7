import pool from '../db.js';
import bcrypt from 'bcrypt';

// Edit these constants if you need different credentials
const EMAIL = 'kurt.reserva@carsu.edu.ph';
const PASSWORD = 'kurt09908';
const ROLE = 'admin';

async function run() {
  try {
    // Check if user already exists
    const exists = await pool.query('SELECT id, email FROM users WHERE email = $1', [EMAIL]);
    if (exists.rowCount > 0) {
      console.log(`User already exists: ${exists.rows[0].email} (id=${exists.rows[0].id})`);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // Insert user
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role, email_verified, created_at)
       VALUES ($1, $2, $3, true, NOW()) RETURNING id, email, role, created_at`,
      [EMAIL, passwordHash, ROLE]
    );

    console.log('Inserted user:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error inserting admin user:', err);
    process.exit(1);
  }
}

run();
