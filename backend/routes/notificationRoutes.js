import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * ✅ GET /api/notifications/:user_id
 * Fetch all notifications for a user with matched item details.
 * Handles both General Items and Student ID categories.
 */
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Return existing notifications for the user, and also synthesize
    // notification-like rows for any matches that involve the user's items
    // but don't yet have a notification row. This ensures the frontend
    // will show notifications if there's anything in the matches table.
    const result = await pool.query(
      `
      WITH user_items AS (
        SELECT 
          id,
          reporter_id AS user_id, -- align to expected alias
          name,
          brand,
          color,
          location,
          type,
          image_url,
          student_id,
          user_claim_status
        FROM items
        WHERE reporter_id = $1
      )

      -- 1) Existing notifications
      SELECT
        n.id,
        n.user_id,
        n.item_id,
        n.match_id,
        n.category,
        n.type,
        n.is_read,
        n.created_at,

  i.name AS item_name,
  i.brand,
  i.color,
  i.location AS item_location,
  i.type AS item_type,
  i.image_url AS item_image_url,
  i.student_id AS item_student_id,
  i.reporter_id AS item_user_id, -- align with schema
  i.claimant_id AS claimant_id,

        matched_i.name AS matched_item_name,
        matched_i.type AS matched_type,
        matched_i.image_url AS matched_image_url,
        matched_i.status AS matched_status,
        matched_i.student_id AS matched_student_id,
    matched_i.location AS matched_location,
  matched_i.description AS matched_description,
  CASE WHEN i.type = 'lost' THEN m.found_item_id ELSE m.lost_item_id END AS matched_item_id,
  i.type AS base_item_type,

    CASE 
      WHEN n.match_id IS NOT NULL THEN (
        CASE WHEN LOWER(n.category) = 'id' THEN matched_i.image_url ELSE matched_i.image_url END
      )
      ELSE i.image_url
    END AS display_image,
    CASE 
      WHEN n.match_id IS NOT NULL THEN (
        CASE WHEN LOWER(n.category) = 'id' THEN matched_i.name ELSE matched_i.name END
      )
      ELSE i.name
    END AS display_name,
  CASE 
    WHEN n.match_id IS NOT NULL THEN (
      CASE WHEN LOWER(n.category) = 'id' THEN matched_i.student_id ELSE NULL END
    )
    ELSE NULL
  END AS display_student_id,
  CASE WHEN n.match_id IS NOT NULL THEN matched_i.description ELSE NULL END AS display_description,
  i.user_claim_status AS base_user_claim_status,
  matched_i.user_claim_status AS matched_user_claim_status,
  u_claimant.full_name AS claimant_full_name,
  u_claimant.profile_picture AS claimant_profile_picture

      FROM notifications n
      LEFT JOIN items i ON n.item_id = i.id
      LEFT JOIN users u_claimant ON i.claimant_id = u_claimant.id
      LEFT JOIN matches m ON n.match_id = m.id
      LEFT JOIN items matched_i ON (
        CASE WHEN i.type = 'lost' THEN m.found_item_id ELSE m.lost_item_id END = matched_i.id
      )
      WHERE n.user_id = $1 AND n.cleared_at IS NULL

      UNION

      -- 2) Matches involving the user's items that do not have a notification yet
      SELECT
        NULL::uuid AS id,
        $1::uuid AS user_id,
        ui.id AS item_id,
        m.id AS match_id,
        CASE WHEN COALESCE(matched_i.student_id, '') <> '' THEN 'id' ELSE 'general' END AS category,
        'match_generated' AS type,
        FALSE AS is_read,
        m.created_at AS created_at,

        ui.name AS item_name,
        ui.brand,
        ui.color,
        ui.location AS item_location,
        ui.type AS item_type,
        ui.image_url AS item_image_url,
        ui.student_id AS item_student_id,
        ui.user_id AS item_user_id,
        NULL::uuid AS claimant_id,

        matched_i.name AS matched_item_name,
        matched_i.type AS matched_type,
        matched_i.image_url AS matched_image_url,
        matched_i.status AS matched_status,
        matched_i.student_id AS matched_student_id,
    matched_i.location AS matched_location,
  matched_i.description AS matched_description,
  matched_i.id AS matched_item_id,
  ui.type AS base_item_type,

    matched_i.image_url AS display_image,
  matched_i.name AS display_name,
  CASE WHEN COALESCE(matched_i.student_id, '') <> '' THEN matched_i.student_id ELSE NULL END AS display_student_id,
  matched_i.description AS display_description,
  ui.user_claim_status AS base_user_claim_status,
  matched_i.user_claim_status AS matched_user_claim_status,
  NULL::text AS claimant_full_name,
  NULL::text AS claimant_profile_picture

      FROM matches m
      -- Only synthesize notifications for matches where the current user is the reporter
      -- of the LOST item. This prevents users who submitted FOUND reports from
      -- seeing generated match rows intended for the lost-report submitter.
      JOIN user_items ui ON ui.id = m.lost_item_id
      JOIN items matched_i ON m.found_item_id = matched_i.id
      WHERE m.id NOT IN (
        SELECT match_id FROM notifications WHERE user_id = $1 AND match_id IS NOT NULL
      )
      AND (
        matched_i.name IS NOT NULL
        OR matched_i.student_id IS NOT NULL
        OR matched_i.image_url IS NOT NULL
      )

      ORDER BY created_at DESC;
      `,
      [user_id]
    );

    // 🔍 Log the returned notifications for debugging
    console.log(`🔔 Returning ${result.rows.length} notifications for user ${user_id}`);
    result.rows.forEach((n, idx) => {
      console.log(`   [${idx}] type=${n.type}, match_id=${n.match_id}, item_name=${n.item_name}, matched_item_name=${n.matched_item_name}, display_name=${n.display_name}`);
      if (n.type === 'claim_approved') {
        console.log(`       claim_approved - item_image_url="${n.item_image_url}", display_image="${n.display_image}"`);
      }
    });
    
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

  /**
   * ✅ GET /api/notifications/id/:id
   * Fetch a single notification by its id with rich item/match context
   */
  router.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `
        SELECT
          n.id,
          n.user_id,
          n.item_id,
          n.match_id,
          n.category,
          n.type,
          n.is_read,
          n.created_at,

          i.name AS item_name,
          i.brand,
          i.color,
          i.location AS item_location,
          i.type AS item_type,
          i.image_url AS item_image_url,
          i.student_id AS item_student_id,
          i.reporter_id AS item_user_id,

          matched_i.id AS matched_item_id,
          matched_i.name AS matched_item_name,
          matched_i.type AS matched_type,
          matched_i.image_url AS matched_image_url,
          matched_i.status AS matched_status,
          matched_i.student_id AS matched_student_id,
          matched_i.location AS matched_location,
          matched_i.description AS matched_description

        FROM notifications n
        LEFT JOIN items i ON n.item_id = i.id
        LEFT JOIN matches m ON n.match_id = m.id
        LEFT JOIN items matched_i ON (
          CASE WHEN i.type = 'lost' THEN m.found_item_id ELSE m.lost_item_id END = matched_i.id
        )
        WHERE n.id = $1
        LIMIT 1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error fetching notification by id:", err);
      res.status(500).json({ error: "Failed to fetch notification" });
    }
  });

/**
 * ✅ PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/**
 * 🆕 PUT /api/notifications/:id/clear
 * Mark notification as cleared/dismissed (won't appear in the list anymore)
 */
router.put("/:id/clear", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE notifications SET cleared_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification cleared successfully",
      notification: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error clearing notification:", err);
    res.status(500).json({ error: "Failed to clear notification" });
  }
});

/**
 * PUT /api/notifications/match/:match_id/clear
 * Create a short-lived notification record for a synthesized match and immediately
 * mark it cleared so that the synthesized notification will not reappear.
 * Expects body: { user_id }
 */
router.put("/match/:match_id/clear", async (req, res) => {
  const { match_id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required in body" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO notifications (user_id, match_id, type, category, is_read, created_at, cleared_at)
      VALUES ($1, $2, 'match_generated', 'general', FALSE, NOW(), NOW())
      RETURNING *
      `,
      [user_id, match_id]
    );

    res.json({ message: 'Synthesized match notification cleared', notification: result.rows[0] });
  } catch (err) {
    console.error('❌ Error clearing synthesized match notification:', err);
    res.status(500).json({ error: 'Failed to clear synthesized match notification' });
  }
});

/**
 * 🆕 PUT /api/notifications/:id/claim
 * Allows user to initiate a claim directly from their notification
 * and emits a Socket.IO event to the security dashboard
 */
router.put("/:id/claim", async (req, res) => {
  const { id } = req.params; // notification ID
  const { claimant_id } = req.body;

  try {
    // ✅ Validate claimant_id
    if (!claimant_id) {
      return res.status(400).json({ message: "Claimant ID is required" });
    }

    // ✅ Find related item from the notification
    const notification = await pool.query(
      `SELECT item_id FROM notifications WHERE id = $1`,
      [id]
    );

    if (notification.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const itemId = notification.rows[0].item_id;

    // ✅ Update item’s claim status
    const result = await pool.query(
      `
      UPDATE items
      SET user_claim_status = 'pending_claim',
          claimant_id = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *;
      `,
      [claimant_id, itemId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = result.rows[0];

    // ✅ Fetch claimant info
    const claimantRes = await pool.query(
      `SELECT id, full_name, email FROM users WHERE id = $1`,
      [claimant_id]
    );

    const claimant = claimantRes.rowCount ? claimantRes.rows[0] : null;

    // ✅ Log for debugging
    console.log(
      `➡️ Claim request from claimant ${claimant_id} for item ${itemId}`
    );

    // ✅ Emit real-time update to the Security Dashboard
    const io = req.app.get("io");
    if (io) {
      io.emit("claimStatusUpdated", {
        item_id: updatedItem.id,
        user_claim_status: updatedItem.user_claim_status,
        claimant_id: updatedItem.claimant_id,
        claimant_name: claimant?.full_name || "Unknown",
        claimant_email: claimant?.email || null,
        claimant_student_id: claimant?.student_id || null,
        student_id: updatedItem.student_id || null, // ✅ Include student_id if the item is an ID
      });
    }

    res.status(200).json({
      message: "Claim initiated successfully via notification",
      item: updatedItem,
      claimant,
    });
  } catch (err) {
    console.error("❌ Error initiating claim from notification:", err);
    res.status(500).json({ error: "Failed to initiate claim" });
  }
});

/**
 * ✅ POST /api/notifications/item-received
 * Create a notification when an item is marked as received by security staff
 * Request body: { item_id, user_id }
 */
router.post("/item-received", async (req, res) => {
  const { item_id, user_id } = req.body;

  if (!item_id || !user_id) {
    return res.status(400).json({ error: "Missing item_id or user_id" });
  }

  try {
    // Create the notification
    const result = await pool.query(
      `
      INSERT INTO notifications (user_id, item_id, type, category, is_read, created_at)
      VALUES ($1, $2, 'item_received', 'delivery', FALSE, NOW())
      RETURNING *
      `,
      [user_id, item_id]
    );

    const notification = result.rows[0];

    // Fetch the item details
    const itemResult = await pool.query(
      `SELECT name, category, student_id FROM items WHERE id = $1`,
      [item_id]
    );

    const item = itemResult.rows[0];

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Emit real-time notification via socket
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${user_id}`).emit("itemReceived", {
        notification_id: notification.id,
        item_id: item_id,
        item_name: item.name,
        item_category: item.category,
        item_student_id: item.student_id,
        message: "The item you delivered or turned over to the security office has been received successfully. Thank you for your cooperation.",
        timestamp: notification.created_at,
      });
    }

    res.status(201).json({
      message: "Item received notification created successfully",
      notification,
    });
  } catch (err) {
    console.error("❌ Error creating item received notification:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * ✅ DELETE /api/notifications/:notification_id
 * Delete a notification by ID
 */
router.delete("/:notification_id", async (req, res) => {
  const { notification_id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 RETURNING id",
      [notification_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
      deleted_id: result.rows[0].id,
    });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;

