import express from "express";
import pool from "../db.js";
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from "../services/emailService.js";

const router = express.Router();

let ensuredClaimMessageColumn = false;

async function ensureClaimMessageColumn() {
  if (ensuredClaimMessageColumn) return;
  try {
    await pool.query(
      "ALTER TABLE claims ADD COLUMN IF NOT EXISTS claimant_message TEXT"
    );
    await pool.query(
      "ALTER TABLE claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()"
    );
  } catch (err) {
    console.error("⚠️ Failed to ensure claims optional columns:", err);
  } finally {
    ensuredClaimMessageColumn = true;
  }
}

const uuidRegex = /^[0-9a-fA-F-]{36}$/;

async function getRelatedItemIds(itemId) {
  const ids = new Set();
  if (itemId && typeof itemId === "string" && uuidRegex.test(itemId)) {
    ids.add(itemId);
  }

  if (!itemId) return Array.from(ids);

  try {
    const matchRes = await pool.query(
      `SELECT lost_item_id, found_item_id
       FROM matches
       WHERE lost_item_id = $1 OR found_item_id = $1`,
      [itemId]
    );

    for (const row of matchRes.rows) {
      if (row.lost_item_id && uuidRegex.test(row.lost_item_id)) {
        ids.add(row.lost_item_id);
      }
      if (row.found_item_id && uuidRegex.test(row.found_item_id)) {
        ids.add(row.found_item_id);
      }
    }
  } catch (err) {
    console.error("⚠️ Failed to resolve related item IDs from matches:", err);
  }

  return Array.from(ids);
}

// Simple logger for any request that reaches this router
// DISABLED: This was logging every pending/count request which happened frequently
// router.use((req, res, next) => {
//   try {
//     console.debug(
//       `[claims] router hit: ${req.method} ${req.originalUrl} from ${
//         req.ip || "unknown"
//       }`
//     );
//   } catch (e) {
//     // swallow logging errors
//   }
//   next();
// });

// DEBUG: quick route check
router.get("/debug", (req, res) => {
  res.status(200).json({ ok: true, route: "/api/claims/debug" });
});

/**
 * @route GET /api/claims
 * @desc Check for existing claims by user_id and item_id (query parameters)
 */
router.get("/", async (req, res) => {
  try {
    const { user_id, item_id } = req.query;

    if (!user_id || !item_id) {
      return res.status(400).json({ message: "user_id and item_id are required" });
    }

    const result = await pool.query(
      `SELECT id, user_id, item_id, status, created_at FROM claims 
       WHERE user_id = $1 AND item_id = $2
       ORDER BY created_at DESC`,
      [user_id, item_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error checking for existing claims:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/claims/pending/count
 * @desc Get number of pending claims for dashboard badge
 */
router.get("/pending/count", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS pending_count FROM claims WHERE status = 'pending'`
    );

    res
      .status(200)
      .json({ pending_count: parseInt(result.rows[0].pending_count) });
  } catch (error) {
    console.error("❌ Error fetching pending claims count:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route POST /api/claims
 * @desc Create a new claim request
 */
// Emit real-time notification for matched items
const emitRealTimeNotification = async (io, userId, itemId, matchDetails) => {
  try {
    const payload = {
      user_id: userId,
      item_id: itemId,
      match_details: matchDetails,
    };
    io.emit("itemMatched", payload);
    console.log(
      `Real-time notification sent for user ${userId} and item ${itemId}`
    );
  } catch (error) {
    console.error("❌ Error emitting real-time notification:", error);
  }
};

router.post("/", async (req, res) => {
  try {
    await ensureClaimMessageColumn();

    const { user_id, item_id, notification_id, message } = req.body;

    if (!user_id || !item_id) {
      return res.status(400).json({ message: "Missing required fields: user_id or item_id" });
    }

    // 🔔 NOTIFICATION LOGIC:
    // - If notification_id is provided (from match notifications), use it
    // - If notification_id is NOT provided (from search page claim flow), do NOT create one
    // Rationale: Users should only see notifications for MATCHED items found in reports,
    // not for their own claim requests from the search page (they already know they claimed it)
    let usedNotificationId = notification_id || null;

    // 🔒 STRICT: Check if this exact user has ANY existing claim (pending, approved, rejected) for this item
    // This prevents ALL duplicate claims regardless of item match relationships
    const directExisting = await pool.query(
      `SELECT id, status FROM claims 
       WHERE user_id = $1 AND item_id = $2 
       LIMIT 1`,
      [user_id, item_id]
    );

    if (directExisting.rows.length > 0) {
      console.warn(
        `⚠️ [claims] Duplicate claim prevented: user ${user_id} already has claim for item ${item_id} (status: ${directExisting.rows[0].status})`
      );
      return res.status(409).json({ 
        message: "You have already submitted a claim for this item", 
        existing_claim_id: directExisting.rows[0].id,
        existing_status: directExisting.rows[0].status
      });
    }

    // Optional: Also check related items as secondary prevention
    const relatedForDupCheck = await getRelatedItemIds(item_id);
    const sanitizedDupCheck = relatedForDupCheck.filter((id) =>
      uuidRegex.test(id)
    );

    if (sanitizedDupCheck.length > 0) {
      const relatedExisting = await pool.query(
        `SELECT id, item_id, status FROM claims
         WHERE user_id = $1 AND item_id = ANY($2::uuid[])
         LIMIT 1`,
        [user_id, sanitizedDupCheck]
      );

      if (relatedExisting.rows.length > 0) {
        console.warn(
          `⚠️ [claims] Duplicate claim prevented: user ${user_id} has claim for related item ${relatedExisting.rows[0].item_id}`
        );
        return res.status(409).json({ 
          message: "You have already claimed a related item", 
          existing_claim_id: relatedExisting.rows[0].id
        });
      }
    }

    // Insert new claim (message is optional in payload but may not have a DB column)
    const result = await pool.query(
      `INSERT INTO claims (user_id, item_id, notification_id, claimant_message, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       RETURNING *`,
      [user_id, item_id, usedNotificationId, message || null]
    );

    // Update item's user_claim_status
    await pool.query(
      `UPDATE items SET user_claim_status = 'pending_claim', updated_at = NOW() WHERE id = $1`,
      [item_id]
    );

    // Also record the claimant on the item row so claimant_id is filled for dashboard/UI
    try {
      await pool.query(
        `UPDATE items SET claimant_id = $1, updated_at = NOW() WHERE id = $2`,
        [user_id, item_id]
      );
    } catch (claimantSetErr) {
      console.warn('⚠️ Failed to set claimant_id on items row:', claimantSetErr);
    }

    const newClaim = result.rows[0];

    // Prepare a friendly suggestion for the claimant
    const claimantSuggestion =
      "Your claim request was submitted. Please visit the Security Office for verification and to complete the claiming process.";

    // Emit real-time notification for the claim to the Security dashboard
    // Use the same event payload shape as the /item/:item_id route for consistency
    try {
      const io = req.app.get("io");
      if (io) {
        const claimDetailRes = await pool.query(
          `
          SELECT 
            c.id AS claim_id,
            c.status,
            c.created_at,
            c.claimant_message,
            u.id AS claimant_id,
            u.full_name AS claimant_name,
            u.email AS claimant_email,
            u.contact_number AS claimant_contact,
            u.department AS claimant_department,
            u.profile_picture AS claimant_profile_picture,
            i.id AS item_id,
            i.name AS item_name,
            i.status AS item_status,
            i.type AS item_type,
            i.category AS item_category,
            i.image_url AS item_image,
            n.id AS notification_id,
            n.item_id AS notification_item_id,
            CASE
              WHEN m.lost_item_id = c.item_id THEN m.found_item_id
              WHEN m.found_item_id = c.item_id THEN m.lost_item_id
              ELSE NULL
            END AS notification_matched_item_id,
            m.lost_item_id,
            m.found_item_id
          FROM claims c
          JOIN users u ON c.user_id = u.id
          JOIN items i ON c.item_id = i.id
          JOIN notifications n ON c.notification_id = n.id
          LEFT JOIN LATERAL (
            SELECT lost_item_id, found_item_id
            FROM matches
            WHERE c.item_id IN (lost_item_id, found_item_id)
            LIMIT 1
          ) m ON TRUE
          WHERE c.id = $1
          LIMIT 1
        `,
          [newClaim.id]
        );

        const claimDetail = claimDetailRes.rows[0] || null;
        if (claimDetail) {
          // Add convenient display fields so clients don't need extra fetches
          claimDetail.display_name = claimDetail.item_name || null;
          claimDetail.display_image = claimDetail.item_image || null;
          claimDetail.claimant_profile_picture = claimDetail.claimant_profile_picture || null;

          io.emit("newClaimRequest", claimDetail);
        }
      }
    } catch (emitErr) {
      console.error(
        "❌ Error emitting newClaimRequest to security dashboard:",
        emitErr
      );
    }

    // Optional: still emit the generic event for other listeners
    try {
      const io = req.app.get("io");
      if (io) {
        const matchDetails = {
          message: message || null,
          created_at: newClaim.created_at,
        };
        emitRealTimeNotification(io, user_id, item_id, matchDetails);
      }
    } catch (e) {
      // non-fatal
    }

    res.status(201).json({
      message: "Claim request created successfully",
      claim: newClaim,
      claimant_message: message || null,
      suggestion: claimantSuggestion,
    });
  } catch (error) {
    console.error("❌ Error creating claim:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/claims/user/:user_id
 * @desc Fetch all claims for a specific user
 */
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit, offset } = req.query;

    // Count total claims for the user (The one who filed the claim)
    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM claims c
       WHERE c.user_id = $1`,
      [user_id]
    );
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    // Fetch paged claims where user is claimant
    let sql = `
      SELECT c.* FROM claims c
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const params = [user_id];
    const lim = parseInt(limit, 10);
    const off = parseInt(offset, 10) || 0;
    if (!Number.isNaN(lim)) {
      params.push(lim);
      sql += ` LIMIT $${params.length}`;
      if (!Number.isNaN(off) && off > 0) {
        params.push(off);
        sql += ` OFFSET $${params.length}`;
      }
    }

    const result = await pool.query(sql, params);
    res.status(200).json({ value: result.rows, count: total });
  } catch (error) {
    console.error("❌ Error fetching claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route GET /api/claims/security/all
 * @desc Fetch all claim requests for the security dashboard
 */
router.get("/security/all", async (req, res) => {
  try {
    await ensureClaimMessageColumn();

    const result = await pool.query(`
      SELECT 
        c.id AS claim_id,
        c.status,
        c.created_at,
        c.claimant_message,
        u.id AS claimant_id,
        u.full_name AS claimant_name,
        u.email AS claimant_email,
        u.contact_number AS claimant_contact,
        u.department AS claimant_department,
        u.profile_picture AS claimant_profile_picture,
        i.id AS item_id,
        i.type AS item_type,
        i.category AS item_category,
        i.image_url AS item_image,
        n.id AS notification_id
      FROM claims c
      JOIN users u ON c.user_id = u.id
      JOIN items i ON c.item_id = i.id
      LEFT JOIN notifications n ON c.notification_id = n.id
      ORDER BY c.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching claims for security dashboard:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/claims/item/:item_id
 * @desc Fetch all claims related to a specific item (for claim modal)
 */
router.get("/item/:item_id", async (req, res) => {
  try {
    await ensureClaimMessageColumn();

    const { item_id } = req.params;
    console.log(
      `[claims] GET /api/claims/item/${item_id} - incoming from ${
        req.ip || req.headers["x-forwarded-for"] || "unknown"
      }`
    );

    const relatedIds = new Set([item_id]);

    try {
      const matchRes = await pool.query(
        `SELECT lost_item_id, found_item_id
         FROM matches
         WHERE lost_item_id = $1 OR found_item_id = $1`,
        [item_id]
      );

      for (const row of matchRes.rows) {
        if (row.lost_item_id) relatedIds.add(row.lost_item_id);
        if (row.found_item_id) relatedIds.add(row.found_item_id);
      }
    } catch (matchErr) {
      console.error(
        "⚠️ Failed to resolve related match IDs for claims lookup:",
        matchErr
      );
    }

    try {
      const notifRes = await pool.query(
        `SELECT 
           n.item_id,
           m.lost_item_id,
           m.found_item_id
         FROM notifications n
         LEFT JOIN matches m ON n.match_id = m.id
         WHERE n.item_id = $1
            OR m.lost_item_id = $1
            OR m.found_item_id = $1`,
        [item_id]
      );

      for (const row of notifRes.rows) {
        if (row.item_id) relatedIds.add(row.item_id);
        if (row.lost_item_id) relatedIds.add(row.lost_item_id);
        if (row.found_item_id) relatedIds.add(row.found_item_id);
      }
    } catch (notifErr) {
      console.error(
        "⚠️ Failed to resolve related notification IDs for claims lookup:",
        notifErr
      );
    }

    const relatedArray = Array.from(relatedIds).filter(
      (id) => typeof id === "string" && id.trim() !== ""
    );

    if (relatedArray.length === 0) {
      console.warn(
        `[claims] No related item IDs resolved for base item ${item_id}. Returning empty list.`
      );
      return res.status(200).json([]);
    }

    const result = await pool.query(
      `
      SELECT 
        c.id AS claim_id,
        c.status,
        c.created_at,
        c.claimant_message,
        u.id AS claimant_id,
        u.full_name AS claimant_name,
        u.email AS claimant_email,
        u.contact_number AS claimant_contact,
        u.department AS claimant_department,
        u.profile_picture AS claimant_profile_picture,
        c.item_id AS claimed_item_id,
        n.item_id AS notification_item_id,
        CASE
          WHEN m.lost_item_id = c.item_id THEN m.found_item_id
          WHEN m.found_item_id = c.item_id THEN m.lost_item_id
          ELSE NULL
        END AS notification_matched_item_id,
        m.lost_item_id,
        m.found_item_id
      FROM claims c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN LATERAL (
        SELECT lost_item_id, found_item_id
        FROM matches
        WHERE c.item_id IN (lost_item_id, found_item_id)
        LIMIT 1
      ) m ON TRUE
      WHERE c.item_id::text = ANY($1::text[])
      ORDER BY c.created_at DESC
      `,
      [relatedArray]
    );

    console.log(
      `[claims] result rows for item ${item_id}: ${result.rows.length}`
    );

    // Return an empty array (200) when there are no claims for the item so
    // the frontend consistently receives a list to render (possibly empty).
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching claims for item:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/claims/:claim_id
 * @desc Debug: fetch a single claim by id
 */
router.get("/:claim_id", async (req, res) => {
  try {
    const { claim_id } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, item_id, status, created_at, claimant_message FROM claims WHERE id = $1 LIMIT 1`,
      [claim_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`❌ Error fetching claim ${req.params.claim_id}:`, err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/**
 * @route POST /api/claims/item/:item_id
 * @desc Convenience: create a claim for a specific item when client has only item_id
 * Body: { user_id, notification_id }
 */
router.post("/item/:item_id", async (req, res) => {
  try {
    await ensureClaimMessageColumn();

    const { item_id } = req.params;
    const { user_id, notification_id, message } = req.body;

    if (!user_id || !notification_id) {
      return res
        .status(400)
        .json({ message: "Missing user_id or notification_id in body" });
    }

    // 🔒 STRICT: Check if this exact user has ANY existing claim for this item
    const directExisting = await pool.query(
      `SELECT * FROM claims
       WHERE user_id = $1 AND item_id = $2
       LIMIT 1`,
      [user_id, item_id]
    );

    if (directExisting.rows.length > 0) {
      console.warn(
        `⚠️ [claims] Duplicate claim prevented (item-route): user ${user_id} already has claim for item ${item_id}`
      );
      return res.status(200).json({ 
        message: "Claim already exists", 
        claim: directExisting.rows[0],
        is_duplicate: true
      });
    }

    // Optional: Also check related items as secondary prevention
    const relatedForDupCheck = await getRelatedItemIds(item_id);
    const sanitizedDupCheck = relatedForDupCheck.filter((id) =>
      uuidRegex.test(id)
    );

    let existingClaimRow = null;
    if (sanitizedDupCheck.length > 0) {
      const existing = await pool.query(
        `SELECT * FROM claims
         WHERE user_id = $1 AND item_id = ANY($2::uuid[])
         ORDER BY created_at DESC
         LIMIT 1`,
        [user_id, sanitizedDupCheck]
      );
      existingClaimRow = existing.rows[0] || null;
    }

    if (existingClaimRow) {
      console.warn(
        `⚠️ [claims] Duplicate claim prevented (item-route, related): user ${user_id} has claim for related item`
      );
      return res.status(200).json({ 
        message: "Claim already exists for a related item", 
        claim: existingClaimRow,
        is_duplicate: true
      });
    }

    const result = await pool.query(
      `INSERT INTO claims (user_id, item_id, notification_id, claimant_message, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW()) RETURNING *`,
      [user_id, item_id, notification_id, message || null]
    );

    // Update item user_claim_status
    await pool.query(
      `UPDATE items SET user_claim_status = 'pending_claim', updated_at = NOW() WHERE id = $1`,
      [item_id]
    );

    // Also record the claimant on the item row so claimant_id is filled for dashboard/UI
    try {
      await pool.query(
        `UPDATE items SET claimant_id = $1, updated_at = NOW() WHERE id = $2`,
        [user_id, item_id]
      );
    } catch (claimantSetErr) {
      console.warn('⚠️ Failed to set claimant_id on items row (item-route):', claimantSetErr);
    }

    const newClaim = result.rows[0];
    console.log(
      `[claims] New claim (item-route) created: id=${newClaim.id}, user_id=${user_id}, item_id=${item_id}`
    );

    // Insert a notification for the claimant to keep them informed
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, item_id, category, type)
           VALUES ($1, $2, $3, $4)`,
        [user_id, item_id, "general", "claim_submitted"]
      );
    } catch (notifErr) {
      console.error(
        "❌ Failed to insert claimant notification (item route):",
        notifErr
      );
    }

    const claimantSuggestion =
      "Your claim request was submitted. Please visit the Security Office for verification and to complete the claiming process.";
    // Emit socket event so security can see new claim
    try {
      const io = req.app.get("io");
      if (io) {
        const claimantRes = await pool.query(
          "SELECT id, full_name, email FROM users WHERE id = $1",
          [user_id]
        );
        const itemRes = await pool.query(
          "SELECT id, name FROM items WHERE id = $1",
          [item_id]
        );
        const payload = {
          id: newClaim.id,
          claim_id: newClaim.id,
          item_id,
          item_name: itemRes.rows[0]?.name || null,
          user_id,
          user_name: claimantRes.rows[0]?.full_name || null,
          user_email: claimantRes.rows[0]?.email || null,
          // include optional claimant message (not persisted unless DB has column)
          claimant_message: message || null,
          requested_at: newClaim.created_at,
        };
        io.emit("newClaimRequest", payload);
      }
    } catch (emitErr) {
      console.error("❌ Error emitting newClaimRequest (item route):", emitErr);
    }

    // Return claim plus the message back to caller for UX
    res.status(201).json({
      message: "Claim created",
      claim: newClaim,
      claimant_message: message || null,
      suggestion: claimantSuggestion,
    });
  } catch (error) {
    console.error("❌ Error creating claim via item route:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route PUT /api/claims/:claim_id/approve
 * @desc Approve a claim request
 */
router.put("/:claim_id/approve", async (req, res) => {
  try {
    await ensureClaimMessageColumn();
    const { claim_id } = req.params;

    // First, fetch the claim to ensure it exists and has user_id (including notification_id to check if from match)
    const fetchResult = await pool.query(
      `SELECT id, user_id, item_id, status, created_at, claimant_message, notification_id FROM claims WHERE id = $1`,
      [claim_id]
    );

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const claim = fetchResult.rows[0];

    // Update the claim status (wrapped with diagnostic logging to capture DB error details)
    let updateResult;
    try {
      const sql = `UPDATE claims SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *`;
      const params = [claim_id];
      updateResult = await pool.query(sql, params);
      // Merge the fetched claim data with the update result
      const updatedClaim = { ...claim, ...updateResult.rows[0] };
      // replace claim reference for downstream code
      // (we keep `claim` variable as-is for emitting earlier data; updatedClaim not used further in this function)
    } catch (dbErr) {
      console.error('❌ Failed executing UPDATE for claim approval', {
        query: `UPDATE claims SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *`,
        params: [claim_id],
        code: dbErr.code,
        position: dbErr.position,
        detail: dbErr.detail,
        message: dbErr.message,
        full: dbErr,
      });
      // Re-throw so outer catch handles the error path as before
      throw dbErr;
    }

    // Fetch item details to get the reporter (reporter_id of the item)
    const itemResult = await pool.query(
      `SELECT id, name, reporter_id as item_reporter_id FROM items WHERE id = $1`,
      [claim.item_id]
    );

    const item = itemResult.rows[0];
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Sync item's user_claim_status and set claimant_id
    try {
      await pool.query(
        `UPDATE items SET user_claim_status = 'confirmed_claim', claimant_id = $1, updated_at = NOW() WHERE id = $2`,
        [claim.user_id, claim.item_id]
      );
      console.log(`✅ Updated item ${claim.item_id} status to confirmed_claim, set claimant_id=${claim.user_id}`);
    } catch (updateErr) {
      console.error(`⚠️ Failed to update item status on approval:`, updateErr);
    }

    // ✅ Update found item status to 'returned' for reference (do NOT delete)
    // This allows the item to stay in the "Found Reports" section for reference purposes
    try {
      if (claim.notification_id) {
        // ✅ CASE 1: Claim came from a MATCH (notification_id exists)
        // Mark BOTH the matched lost item and the found item as 'returned' if they are in "In Security Custody" status
        console.log(`🔍 Claim came from match (notification_id: ${claim.notification_id}). Marking both matched items as returned...`);
        
        // Get the match relationship to find both items
        const matchResult = await pool.query(
          `SELECT lost_item_id, found_item_id FROM matches 
           WHERE lost_item_id = $1 OR found_item_id = $1`,
          [claim.item_id]
        );

        if (matchResult.rows.length > 0) {
          const match = matchResult.rows[0];
          const lostItemId = match.lost_item_id;
          const foundItemId = match.found_item_id;

          // Get the status of both items
          const lostItemStatusResult = await pool.query(
            `SELECT status FROM items WHERE id = $1`,
            [lostItemId]
          );
          const foundItemStatusResult = await pool.query(
            `SELECT status FROM items WHERE id = $1`,
            [foundItemId]
          );

          const lostItemStatus = lostItemStatusResult.rows.length > 0 ? lostItemStatusResult.rows[0].status : null;
          const foundItemStatus = foundItemStatusResult.rows.length > 0 ? foundItemStatusResult.rows[0].status : null;

          console.log(`📋 Lost item status: ${lostItemStatus}, Found item status: ${foundItemStatus}`);

          // Mark both as returned when a claim is approved
          const now = new Date().toISOString();
          
          // Always mark the lost item as returned when claim is approved
          try {
            await pool.query(
              `UPDATE items SET status = 'returned', return_date = $1, updated_at = NOW() WHERE id = $2`,
              [now, lostItemId]
            );
            console.log(`✅ Marked lost item as returned: ${lostItemId}`);
          } catch (err) {
            console.error(`⚠️ Failed to mark lost item as returned:`, err);
          }

          // Always mark the found item as returned when claim is approved
          try {
            await pool.query(
              `UPDATE items SET status = 'returned', return_date = $1, updated_at = NOW() WHERE id = $2`,
              [now, foundItemId]
            );
            console.log(`✅ Marked found item as returned: ${foundItemId}`);
          } catch (err) {
            console.error(`⚠️ Failed to mark found item as returned:`, err);
          }
        }
      } else {
        // ✅ CASE 2: Claim came from SEARCH PAGE (no notification_id)
        // Mark the found item and any related lost items as 'returned'
        console.log(`🔍 Claim came from search page (no notification_id). Marking item and related matches as returned...`);
        
        const now = new Date().toISOString();
        
        // Always mark the claimed found item as returned
        try {
          await pool.query(
            `UPDATE items SET status = 'returned', return_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, claim.item_id]
          );
          console.log(`✅ Marked found item as returned: ${claim.item_id}`);
        } catch (err) {
          console.error(`⚠️ Failed to mark found item as returned:`, err);
        }
        
        // Also check for any related lost items in matches and mark them as returned
        try {
          const relatedMatchResult = await pool.query(
            `SELECT lost_item_id, found_item_id FROM matches 
             WHERE lost_item_id = $1 OR found_item_id = $1`,
            [claim.item_id]
          );
          
          if (relatedMatchResult.rows.length > 0) {
            const match = relatedMatchResult.rows[0];
            const lostItemId = match.lost_item_id;
            
            // Mark the related lost item as returned too
            await pool.query(
              `UPDATE items SET status = 'returned', return_date = $1, updated_at = NOW() WHERE id = $2`,
              [now, lostItemId]
            );
            console.log(`✅ Marked related lost item as returned: ${lostItemId}`);
          }
        } catch (err) {
          console.error(`⚠️ Failed to mark related lost item as returned:`, err);
        }
      }
    } catch (statusErr) {
      console.error(`⚠️ Failed to update item status on claim approval:`, statusErr);
      // Continue anyway - this is not critical for claim approval
    }

    // 🔔 Create database notifications for both claimant and reporter
    const claimantMessage = "You've successfully claimed the item.";
    const reporterMessage = "The item you turned over has been claimed by the rightful owner.";

    try {
      // Notification for claimant
      // Note: Don't insert is_read as a column - let DB default it if it has a DEFAULT constraint
      console.log(`[DEBUG] About to insert claimant notification with params:`, {
        user_id: claim.user_id,
        item_id: claim.item_id,
        category: "general",
        type: "claim_approved",
        is_read: false,
      });
      
      const claimantNotifSql = `INSERT INTO notifications (user_id, item_id, category, type, is_read)
         VALUES ($1, $2, $3, $4, $5)`;
      const claimantNotifParams = [claim.user_id, claim.item_id, "general", "claim_approved", false];
      
      console.log(`[DEBUG] Claimant notif SQL:`, claimantNotifSql);
      console.log(`[DEBUG] Claimant notif params:`, claimantNotifParams);
      
      await pool.query(claimantNotifSql, claimantNotifParams);
      console.log(`✅ Created claim approval notification for claimant ${claim.user_id}`);

      // Notification for item reporter (only if different from claimant)
      if (item.item_reporter_id && item.item_reporter_id !== claim.user_id) {
        console.log(`[DEBUG] About to insert reporter notification with params:`, {
          user_id: item.item_reporter_id,
          item_id: claim.item_id,
          category: "general",
          type: "item_claimed",
          is_read: false,
        });
        
        const reporterNotifSql = `INSERT INTO notifications (user_id, item_id, category, type, is_read)
           VALUES ($1, $2, $3, $4, $5)`;
        const reporterNotifParams = [item.item_reporter_id, claim.item_id, "general", "item_claimed", false];
        
        console.log(`[DEBUG] Reporter notif SQL:`, reporterNotifSql);
        console.log(`[DEBUG] Reporter notif params:`, reporterNotifParams);
        
        await pool.query(reporterNotifSql, reporterNotifParams);
        console.log(`✅ Created item claimed notification for reporter ${item.item_reporter_id}`);
      }
    } catch (notifErr) {
      console.error("⚠️ Failed to insert notifications:", {
        message: notifErr.message,
        code: notifErr.code,
        position: notifErr.position,
        detail: notifErr.detail,
        hint: notifErr.hint,
        sqlState: notifErr.sqlState,
        routine: notifErr.routine,
        file: notifErr.file,
        line: notifErr.line,
        full: notifErr,
      });
      // Continue anyway - socket emit is more important for real-time
    }

    // 🔔 Emit real-time notifications to both claimant and reporter
    const io = req.app.get("io");
    if (io) {
      try {
        // Emit to claimant's room
        io.to(`user_${claim.user_id}`).emit("claimApproved", {
          claim_id: claim.id,
          user_id: claim.user_id,
          item_id: claim.item_id,
          item_name: item.name,
          status: "approved",
          message: claimantMessage,
          notification_type: "claim_approved",
          timestamp: new Date().toISOString(),
        });
        console.log(`✅ Emitted claimApproved event to claimant ${claim.user_id}`);
      } catch (socketErr) {
        console.error("⚠️ Failed to emit claimApproved socket event to claimant:", socketErr);
      }

      // Emit to item reporter's room (only if different from claimant)
      if (item.item_reporter_id && item.item_reporter_id !== claim.user_id) {
        try {
          io.to(`user_${item.item_reporter_id}`).emit("itemClaimed", {
            claim_id: claim.id,
            item_id: claim.item_id,
            item_reporter_id: item.item_reporter_id,
            item_name: item.name,
            claimant_id: claim.user_id,
            status: "approved",
            message: reporterMessage,
            notification_type: "item_claimed",
            timestamp: new Date().toISOString(),
          });
          console.log(`✅ Emitted itemClaimed event to reporter ${item.item_reporter_id}`);
        } catch (socketErr) {
          console.error("⚠️ Failed to emit itemClaimed socket event to reporter:", socketErr);
        }
      }
    }

    // 📧 Send email notification to claimant about approval
    try {
      const userResult = await pool.query(
        `SELECT email, full_name FROM users WHERE id = $1`,
        [claim.user_id]
      );
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await sendClaimApprovedEmail(user.email, {
          claimantName: user.full_name,
          itemName: item.name,
          itemCategory: claim.item_category || 'General',
        });
      }
    } catch (emailErr) {
      console.error("⚠️ Failed to send claim approved email:", emailErr.message);
      // Continue anyway - in-app notification is more important
    }

    res.status(200).json({ message: "Claim approved", claim });
  } catch (error) {
    console.error("❌ Error approving claim:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route PUT /api/claims/:claim_id/reject
 * @desc Reject a claim request
 */
router.put("/:claim_id/reject", async (req, res) => {
  try {
    await ensureClaimMessageColumn();
    const { claim_id } = req.params;
    console.log(`🔁 PUT /api/claims/${claim_id}/reject called from ${req.ip || req.headers['x-forwarded-for'] || 'unknown'}`);

    const result = await pool.query(
      `UPDATE claims SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [claim_id]
    );

    console.log(`📋 DB update returned ${result.rows.length} row(s) for claim_id=${claim_id}`);

    if (result.rows.length === 0) {
      console.warn(`❌ Claim not found when rejecting: ${claim_id}`);
      return res.status(404).json({ message: "Claim not found" });
    }

    const claim = result.rows[0];

    // Sync item's user_claim_status on rejection
    try {
      await pool.query(
        `UPDATE items SET user_claim_status = 'rejected_claim', updated_at = NOW() WHERE id = $1`,
        [claim.item_id]
      );
      console.log(`✅ Updated item ${claim.item_id} status to rejected_claim`);
    } catch (updateErr) {
      console.error(`⚠️ Failed to update item status on rejection:`, updateErr);
    }

    // 🔔 Create database notification for claimant
    const rejectionMessage = "Your claim has been rejected. You may review and resubmit if you believe this was incorrect.";
    try {
      console.log(`[DEBUG] Inserting rejection notification for user ${claim.user_id} on item ${claim.item_id}`);
      await pool.query(
        `INSERT INTO notifications (user_id, item_id, category, type, is_read)
         VALUES ($1, $2, $3, $4, $5)`,
        [claim.user_id, claim.item_id, "general", "claim_rejected", false]
      );
      console.log(`✅ Created claim rejection notification for user ${claim.user_id}`);
    } catch (notifErr) {
      console.error("⚠️ Failed to insert claim rejection notification:", {
        message: notifErr.message,
        code: notifErr.code,
        position: notifErr.position,
      });
      // Continue anyway - socket emit is more important for real-time
    }

    // 🔔 Emit real-time notification to claimant
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("claimRejected", {
          claim_id: claim.id,
          user_id: claim.user_id,
          item_id: claim.item_id,
          status: "rejected",
          message: rejectionMessage,
          timestamp: new Date().toISOString(),
        });
        console.log(`❌ Emitted claimRejected event for user ${claim.user_id}, claim ${claim.id}`);
      }
    } catch (socketErr) {
      console.error("⚠️ Failed to emit claimRejected socket event:", socketErr);
      // Continue anyway - don't fail the response if socket emit fails
    }

    // 📧 Send email notification to claimant about rejection
    try {
      const userResult = await pool.query(
        `SELECT email, full_name FROM users WHERE id = $1`,
        [claim.user_id]
      );
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        // Fetch item details for email
        const itemResult = await pool.query(
          `SELECT name, category FROM items WHERE id = $1`,
          [claim.item_id]
        );
        const item = itemResult.rows[0];
        await sendClaimRejectedEmail(user.email, {
          claimantName: user.full_name,
          itemName: item?.name || 'Item',
          itemCategory: item?.category || 'General',
        });
      }
    } catch (emailErr) {
      console.error("⚠️ Failed to send claim rejected email:", emailErr.message);
      // Continue anyway - in-app notification is more important
    }

    res.status(200).json({ message: "Claim rejected", claim });
  } catch (error) {
    console.error("❌ Error rejecting claim:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route GET /api/claims/pending/count
 * @desc Get number of pending claims for dashboard badge
 */
router.get("/pending/count", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS pending_count FROM claims WHERE status = 'pending'`
    );

    res
      .status(200)
      .json({ pending_count: parseInt(result.rows[0].pending_count) });
  } catch (error) {
    console.error("❌ Error fetching pending claims count:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @route DELETE /api/claims/:claim_id
 * @desc Delete a rejected or approved claim (security staff only)
 */
router.delete("/:claim_id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})", async (req, res) => {
  try {
    const { claim_id } = req.params;

    console.log(`🗑️ DELETE route matched. claim_id param: "${claim_id}"`);
    console.log(`   Type: ${typeof claim_id}, Length: ${claim_id?.length}`);

    // First, fetch the claim to verify it exists and get its status
    const claimRes = await pool.query(
      `SELECT id, status, user_id FROM claims WHERE id = $1`,
      [claim_id]
    );

    console.log(`📊 Database query result for claim ${claim_id}:`, claimRes.rows.length > 0 ? claimRes.rows[0] : 'NOT FOUND');

    if (claimRes.rows.length === 0) {
      console.warn(`❌ Claim not found in database for id: "${claim_id}"`);
      // Debug: show what claims exist
      const allClaims = await pool.query(`SELECT id, status, created_at FROM claims ORDER BY created_at DESC LIMIT 5`);
      console.log(`📋 Sample of claims in database (last 5):`, allClaims.rows.map(c => ({ id: c.id, status: c.status })));
      return res.status(404).json({ message: "Claim not found", error: `No claim with id "${claim_id}"` });
    }

    const claim = claimRes.rows[0];

    // Only allow deletion of rejected and approved claims (prevent accidental deletion of pending claims)
    if (claim.status !== "rejected" && claim.status !== "approved") {
      return res.status(403).json({ 
        message: `Cannot delete ${claim.status} claims. Only rejected or approved claims can be deleted.` 
      });
    }

    // Delete the claim
    const deleteRes = await pool.query(
      `DELETE FROM claims WHERE id = $1 RETURNING *`,
      [claim_id]
    );

    console.log(`✅ ${claim.status} claim deleted: ${claim_id} (user: ${claim.user_id})`);

    res.status(200).json({ 
      message: `${claim.status} claim deleted successfully`, 
      deleted_claim_id: claim_id 
    });
  } catch (error) {
    console.error("❌ Error deleting claim:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
