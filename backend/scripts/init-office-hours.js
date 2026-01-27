import pool from "../db.js";

async function initializeOfficeHoursTables() {
  try {
    console.log("🔄 Initializing office hours tables...");

    // Create office_hours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS office_hours (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
        opening_time TIME NOT NULL DEFAULT '08:00:00',
        closing_time TIME NOT NULL DEFAULT '17:00:00',
        is_open BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ office_hours table created/verified");

    // Create office_closures table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS office_closures (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        closure_date DATE NOT NULL,
        closure_start_time TIME,
        closure_end_time TIME,
        is_all_day BOOLEAN NOT NULL DEFAULT true,
        reason VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(closure_date, event_name)
      )
    `);
    console.log("✅ office_closures table created/verified");

    // Insert default office hours
    await pool.query(`
      INSERT INTO office_hours (day_of_week, opening_time, closing_time, is_open, created_at, updated_at)
      VALUES
        (0, '08:00:00', '17:00:00', false, NOW(), NOW()),
        (1, '08:00:00', '17:00:00', true, NOW(), NOW()),
        (2, '08:00:00', '17:00:00', true, NOW(), NOW()),
        (3, '08:00:00', '17:00:00', true, NOW(), NOW()),
        (4, '08:00:00', '17:00:00', true, NOW(), NOW()),
        (5, '08:00:00', '17:00:00', true, NOW(), NOW()),
        (6, '08:00:00', '17:00:00', false, NOW(), NOW())
      ON CONFLICT (day_of_week) DO NOTHING
    `);
    console.log("✅ Default office hours initialized");

    // Verify
    const result = await pool.query(
      "SELECT day_of_week, opening_time, closing_time, is_open FROM office_hours ORDER BY day_of_week"
    );
    console.log("📋 Current office hours:");
    result.rows.forEach((row) => {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const status = row.is_open ? `${row.opening_time} - ${row.closing_time}` : "CLOSED";
      console.log(`   ${days[row.day_of_week]}: ${status}`);
    });

    console.log("✅ Office hours initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing office hours tables:", error);
    process.exit(1);
  }
}

initializeOfficeHoursTables();
