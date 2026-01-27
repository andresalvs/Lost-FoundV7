import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * @route GET /api/office-hours/status
 * @desc Get current office status (open/closed)
 */
router.get("/status", async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check for special closure on this date
    const closureResult = await pool.query(
      `SELECT * FROM office_closures 
       WHERE closure_date = $1 AND (is_all_day = true OR (closure_start_time <= $2 AND closure_end_time >= $2))`,
      [now.toISOString().split("T")[0], currentTime]
    );

    if (closureResult.rows.length > 0) {
      const closure = closureResult.rows[0];
      return res.status(200).json({
        is_open: false,
        status: "closed",
        reason: closure.reason || "Office Closed",
        event_name: closure.event_name,
        closure_start_time: closure.closure_start_time,
        closure_end_time: closure.closure_end_time,
        is_all_day: closure.is_all_day,
        notes: closure.notes,
      });
    }

    // Check regular hours
    const hoursResult = await pool.query(
      `SELECT * FROM office_hours WHERE day_of_week = $1`,
      [dayOfWeek]
    );

    if (hoursResult.rows.length === 0) {
      return res.status(200).json({
        is_open: false,
        status: "closed",
        reason: "Office Closed",
      });
    }

    const hours = hoursResult.rows[0];

    if (!hours.is_open) {
      return res.status(200).json({
        is_open: false,
        status: "closed",
        reason: "Office Closed",
        day: getDayName(dayOfWeek),
      });
    }

    // Compare current time with opening/closing times
    const opening = hours.opening_time.slice(0, 5);
    const closing = hours.closing_time.slice(0, 5);
    const isCurrentlyOpen = currentTime >= opening && currentTime < closing;

    res.status(200).json({
      is_open: isCurrentlyOpen,
      status: isCurrentlyOpen ? "open" : "closed",
      current_time: currentTime,
      opening_time: opening,
      closing_time: closing,
      day: getDayName(dayOfWeek),
    });
  } catch (error) {
    console.error("❌ Error fetching office status:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/office-hours/today
 * @desc Get today's office hours
 */
router.get("/today", async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dateStr = now.toISOString().split("T")[0];

    // Check for special closure
    const closureResult = await pool.query(
      `SELECT * FROM office_closures WHERE closure_date = $1`,
      [dateStr]
    );

    if (closureResult.rows.length > 0) {
      return res.status(200).json({
        is_special_closure: true,
        closures: closureResult.rows,
      });
    }

    // Get regular hours
    const hoursResult = await pool.query(
      `SELECT * FROM office_hours WHERE day_of_week = $1`,
      [dayOfWeek]
    );

    if (hoursResult.rows.length === 0) {
      return res.status(200).json({
        is_open: false,
        opening_time: null,
        closing_time: null,
      });
    }

    const hours = hoursResult.rows[0];
    res.status(200).json({
      is_open: hours.is_open,
      opening_time: hours.opening_time.slice(0, 5),
      closing_time: hours.closing_time.slice(0, 5),
      day: getDayName(dayOfWeek),
    });
  } catch (error) {
    console.error("❌ Error fetching today's hours:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/office-hours/week
 * @desc Get office hours for the entire week
 */
router.get("/week", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT day_of_week, opening_time, closing_time, is_open 
       FROM office_hours 
       ORDER BY day_of_week`
    );

    const weekHours = result.rows.map((row) => ({
      day: getDayName(row.day_of_week),
      day_of_week: row.day_of_week,
      opening_time: row.opening_time ? row.opening_time.slice(0, 5) : null,
      closing_time: row.closing_time ? row.closing_time.slice(0, 5) : null,
      is_open: row.is_open,
    }));

    res.status(200).json(weekHours);
  } catch (error) {
    console.error("❌ Error fetching weekly hours:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/office-hours/closures
 * @desc Get upcoming special closures
 */
router.get("/closures", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // Next 30 days

    const result = await pool.query(
      `SELECT event_name, closure_date, closure_start_time, closure_end_time, reason, notes, is_all_day 
       FROM office_closures 
       WHERE closure_date >= $1 AND closure_date <= $2
       ORDER BY closure_date`,
      [today, futureDate.toISOString().split("T")[0]]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching closures:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route PUT /api/office-hours/:day
 * @desc Update office hours for a specific day (admin only)
 */
router.put("/:day", async (req, res) => {
  try {
    const { day } = req.params;
    const { opening_time, closing_time, is_open } = req.body;

    // Validate day is 0-6
    if (isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ message: "Invalid day of week" });
    }

    const result = await pool.query(
      `UPDATE office_hours 
       SET opening_time = $1, closing_time = $2, is_open = $3, updated_at = NOW()
       WHERE day_of_week = $4
       RETURNING *`,
      [opening_time, closing_time, is_open, day]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Office hours not found" });
    }

    console.log(`✅ Office hours updated for day ${day}`);
    res.status(200).json({
      message: "Office hours updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating office hours:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route POST /api/office-hours/closure
 * @desc Add a special closure (admin only)
 */
router.post("/closure", async (req, res) => {
  try {
    const {
      event_name,
      closure_date,
      closure_start_time,
      closure_end_time,
      reason,
      notes,
      is_all_day,
    } = req.body;

    if (!event_name || !closure_date) {
      return res
        .status(400)
        .json({ message: "event_name and closure_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO office_closures (event_name, closure_date, closure_start_time, closure_end_time, reason, notes, is_all_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [event_name, closure_date, closure_start_time, closure_end_time, reason, notes, is_all_day === false ? false : true]
    );

    console.log(`✅ Special closure added: ${event_name} on ${closure_date}`);
    res.status(201).json({
      message: "Special closure added",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error adding closure:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res
        .status(409)
        .json({ message: "Closure already exists for this date and event" });
    }
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route DELETE /api/office-hours/closure/:closure_id
 * @desc Delete a special closure (admin only)
 */
router.delete("/closure/:closure_id", async (req, res) => {
  try {
    const { closure_id } = req.params;

    const result = await pool.query(
      `DELETE FROM office_closures WHERE id = $1 RETURNING *`,
      [closure_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Closure not found" });
    }

    console.log(`✅ Closure deleted: ${closure_id}`);
    res.status(200).json({
      message: "Closure deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting closure:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Helper function to get day name from day of week
function getDayName(dayOfWeek) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek];
}

export default router;
