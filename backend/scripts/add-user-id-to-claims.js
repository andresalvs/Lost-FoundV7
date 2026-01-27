import pool from "../db.js";

async function addUserIdToClaimsTable() {
  try {
    console.log("🔍 Checking if user_id column exists in claims table...");
    
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'claims' AND column_name = 'user_id'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log("✅ user_id column already exists in claims table");
      process.exit(0);
    }
    
    console.log("❌ user_id column not found, adding it now...");
    
    // Add the user_id column with a foreign key reference
    await pool.query(`
      ALTER TABLE claims
      ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE
    `);
    
    console.log("✅ Successfully added user_id column to claims table");
    
    // Set NOT NULL constraint (optional - only if you want all claims to have a user)
    // await pool.query(`ALTER TABLE claims ALTER COLUMN user_id SET NOT NULL`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding user_id column:", error);
    process.exit(1);
  }
}

addUserIdToClaimsTable();
