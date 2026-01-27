import pool from "../db.js";

async function runMigration() {
  try {
    console.log("🔄 Running migration: Adding status and accepted_at columns...");

    // Add status column
    await pool.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
      CHECK (status IN ('pending', 'in_security_custody', 'approved', 'rejected', 'returned'))
    `);
    console.log("✅ Added status column");

    // Add accepted_at column
    await pool.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ
    `);
    console.log("✅ Added accepted_at column");

    // Create index on status
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)
    `);
    console.log("✅ Created index on status");

    // Create index on accepted_at
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_items_accepted_at ON items(accepted_at)
    `);
    console.log("✅ Created index on accepted_at");

    // Update existing items to have pending status
    await pool.query(`
      UPDATE items SET status = 'pending' WHERE status IS NULL OR status = ''
    `);
    console.log("✅ Updated existing items with pending status");

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
