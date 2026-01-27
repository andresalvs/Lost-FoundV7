import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * ✅ GET /api/items
 * Fetch all items (optional filters by type, category, user, or status)
 * Example: /api/items?type=lost&category=Electronics
 */
router.get("/", async (req, res) => {
  // Support pagination via query params: limit (int) and offset (int)
  const { type, category, user_id, status, limit, offset } = req.query;

  try {
    // Build base WHERE clauses and params so we can reuse for count and data queries
    let baseFrom = `FROM items i
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN users u_claimant ON i.claimant_id = u_claimant.id`;

    const whereClauses = [];
    const params = [];

    if (type) {
      params.push(type);
      whereClauses.push(`i.type = $${params.length}`);
    }

    if (category) {
      params.push(category);
      whereClauses.push(`i.category = $${params.length}`);
    }

    if (user_id) {
      params.push(user_id);
      whereClauses.push(`i.reporter_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereClauses.push(`i.status = $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count total matching rows
    const countSql = `SELECT COUNT(*) AS total ${baseFrom} ${whereSql}`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].total || 0, 10);

    // Now fetch page of results
    let dataSql = `SELECT i.*, 
      u_reporter.full_name AS reporter_name, 
      u_reporter.email AS reporter_email,
      u_reporter.contact_number AS reporter_contact,
      u_reporter.profile_picture AS reporter_profile_picture,
      u_reporter.id AS reporter_user_id,
      u_claimant.full_name AS claimant_name, 
      u_claimant.profile_picture AS claimant_profile_picture
      ${baseFrom} ${whereSql} ORDER BY i.created_at DESC`;

    const lim = parseInt(limit, 10);
    const off = parseInt(offset, 10) || 0;
    if (!Number.isNaN(lim)) {
      // Add LIMIT/OFFSET using additional params
      params.push(lim);
      dataSql += ` LIMIT $${params.length}`;
      if (!Number.isNaN(off) && off > 0) {
        params.push(off);
        dataSql += ` OFFSET $${params.length}`;
      }
    }

    const result = await pool.query(dataSql, params);
    res.json({ value: result.rows, count: total });
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/**
 * 🔍 SEARCH ROUTE — Find items in security custody (found items)
 * Examples:
 * - /api/items/search?itemName=Black%20Umbrella  (partial name match with fuzzy ranking on frontend)
 * - /api/items/search?studentId=221-01878       (exact student_id match)
 * Backwards-compatible: /api/items/search?query=wallet (partial match or id detection)
 */
router.get("/search", async (req, res) => {
  const { query, itemName, studentId } = req.query;

  try {
    let sql = `
      SELECT i.*, 
        u_reporter.full_name AS reporter_name, 
        u_reporter.email AS reporter_email,
        u_reporter.contact_number AS reporter_contact,
        u_reporter.profile_picture AS reporter_profile_picture,
        u_reporter.id AS reporter_user_id
      FROM items i
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      WHERE i.type = 'found'
      AND i.status = 'in_security_custody'
    `;
    const params = [];

    // Prefer explicit params: studentId or itemName
    if (studentId) {
      // Exact match for student ID
      params.push(studentId);
      sql += ` AND i.student_id = $${params.length}`;
    } else if (itemName) {
      // Partial name match (LIKE) - frontend will do fuzzy ranking with Fuse.js
      params.push(`%${itemName}%`);
      sql += ` AND (LOWER(i.name) LIKE LOWER($${params.length}) OR LOWER(i.brand) LIKE LOWER($${params.length}) OR LOWER(i.color) LIKE LOWER($${params.length}))`;
    } else if (query) {
      // Legacy behavior: detect student ID format or do partial name match
      const isStudentId = /^\d{3}-\d{5}$/.test(query);

      if (isStudentId) {
        params.push(query);
        sql += ` AND i.student_id = $${params.length}`;
      } else {
        params.push(`%${query}%`);
        sql += ` AND LOWER(i.name) LIKE LOWER($${params.length})`;
      }
    }

    sql += ` ORDER BY i.created_at DESC`;
    
    console.log('🔍 SEARCH DEBUG:');
    console.log(`  studentId=${studentId}, itemName=${itemName}, query=${query}`);
    console.log(`  SQL: ${sql}`);
    console.log(`  Params: ${JSON.stringify(params)}`);

    const result = await pool.query(sql, params);

    // Normalize matching context coming from the caller.
    const rawSourceId =
      typeof req.query.source_item_id === "string"
        ? req.query.source_item_id.trim()
        : "";
    const rawReporterId =
      typeof req.query.reporter_id === "string"
        ? req.query.reporter_id.trim()
        : "";

    const sourceItemId = rawSourceId || null;
    const reporterId = rawReporterId || null;

    const normalizedQuery =
      typeof query === "string" && query.trim()
        ? query.trim().toLowerCase()
        : null;
    const normalizedStudentFilter =
      typeof studentId === "string" && studentId.trim()
        ? studentId.trim().toLowerCase()
        : normalizedQuery && /^\d{3}-\d{5}$/.test(normalizedQuery)
        ? normalizedQuery
        : null;
    const normalizedNameFilter =
      typeof itemName === "string" && itemName.trim()
        ? itemName.trim().toLowerCase()
        : !normalizedStudentFilter && normalizedQuery
        ? normalizedQuery
        : null;

    // Gather the set of candidate "lost" items that belong to the reporter so we can
    // automatically pair them with any found items returned by this search.
    const candidateLostItems = new Map();

    if (sourceItemId) {
      try {
        const sourceLookup = await pool.query(
          `SELECT id, reporter_id, category, name, student_id
           FROM items
           WHERE id = $1`,
          [sourceItemId]
        );

        if (sourceLookup.rows.length > 0) {
          candidateLostItems.set(sourceItemId, sourceLookup.rows[0]);
        } else if (reporterId) {
          // Fall back to minimal metadata so we can still attempt a match insert.
          candidateLostItems.set(sourceItemId, {
            id: sourceItemId,
            reporter_id: reporterId,
            category: null,
            name: null,
            student_id: null,
          });
        }
      } catch (err) {
        console.error(
          "⚠️ Failed to load source item for match generation:",
          err
        );
        if (reporterId) {
          candidateLostItems.set(sourceItemId, {
            id: sourceItemId,
            reporter_id: reporterId,
            category: null,
            name: null,
            student_id: null,
          });
        }
      }
    }

    if (reporterId) {
      try {
        const reporterLostItems = await pool.query(
          `SELECT id, reporter_id, category, name, student_id
           FROM items
           WHERE reporter_id = $1
             AND type = 'lost'`,
          [reporterId]
        );

        for (const lostItem of reporterLostItems.rows) {
          if (!candidateLostItems.has(lostItem.id)) {
            candidateLostItems.set(lostItem.id, lostItem);
          } else {
            // Prefer the richer row pulled from the database.
            candidateLostItems.set(lostItem.id, {
              ...candidateLostItems.get(lostItem.id),
              ...lostItem,
            });
          }
        }
      } catch (err) {
        console.error(
          "⚠️ Failed to load reporter lost items for matching:",
          err
        );
      }
    }

    if (
      candidateLostItems.size > 0 &&
      Array.isArray(result.rows) &&
      result.rows.length > 0
    ) {
      console.log(`📦 MATCHING: ${candidateLostItems.size} lost items vs ${result.rows.length} found items`);
      const io = req.app.get("io");

      for (const foundItem of result.rows) {
        const foundId = foundItem.id;
        const foundStudent =
          typeof foundItem.student_id === "string" &&
          foundItem.student_id.trim()
            ? foundItem.student_id.trim().toLowerCase()
            : null;
        const foundName =
          typeof foundItem.name === "string" && foundItem.name.trim()
            ? foundItem.name.trim().toLowerCase()
            : null;
        const foundCategory =
          typeof foundItem.category === "string" && foundItem.category.trim()
            ? foundItem.category.trim().toLowerCase()
            : null;
        
        console.log(`📍 Found item: id=${foundId}, category=${foundCategory}, student_id=${foundStudent}, name=${foundName}`);

        for (const [lostId, lostItem] of candidateLostItems.entries()) {
          if (!lostId || foundId === lostId) continue;

          const lostStudent =
            typeof lostItem?.student_id === "string" &&
            lostItem.student_id.trim()
              ? lostItem.student_id.trim().toLowerCase()
              : null;
          const lostName =
            typeof lostItem?.name === "string" && lostItem.name.trim()
              ? lostItem.name.trim().toLowerCase()
              : null;
          const lostCategory =
            typeof lostItem?.category === "string" && lostItem.category.trim()
              ? lostItem.category.trim().toLowerCase()
              : null;

          // SPECIAL HANDLING FOR ID ITEMS: Match ONLY on student_id, regardless of name
          if (lostCategory === 'id' && foundCategory === 'id') {
            // For ID items, match only on student ID
            const idStudentMatches = foundStudent && lostStudent && foundStudent === lostStudent;
            console.log(`🔍 ID MATCH DEBUG: foundStudent="${foundStudent}", lostStudent="${lostStudent}", match=${idStudentMatches}`);
            if (!idStudentMatches) continue;
          } else {
            // For non-ID items, match on student_id OR name
            const studentMatches =
              (normalizedStudentFilter &&
                lostStudent &&
                lostStudent === normalizedStudentFilter) ||
              (foundStudent && lostStudent && foundStudent === lostStudent);

            const nameMatches =
              (normalizedNameFilter &&
                lostName &&
                lostName === normalizedNameFilter) ||
              (foundName && lostName && foundName === lostName);

            if (!studentMatches && !nameMatches) continue;
          }

          if (foundCategory && lostCategory && foundCategory !== lostCategory)
            continue;

          const existingMatch = await pool.query(
            `SELECT 1 FROM matches
             WHERE (lost_item_id = $1 AND found_item_id = $2)
                OR (lost_item_id = $2 AND found_item_id = $1)
             LIMIT 1`,
            [lostId, foundId]
          );

          if (existingMatch.rows.length > 0) continue;

          try {
            const matchInsert = await pool.query(
              `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
               VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
               RETURNING id`,
              [lostId, foundId, 100.0]
            );

            const matchId = matchInsert.rows[0].id;
            // Resolve the authoritative reporter_id from the DB for the lost item.
            // Candidate lostItem entries may have been synthesized with a fallback
            // reporter_id (the search caller) — we must avoid using that fallback
            // because it can incorrectly notify the found-item submitter.
            let notificationUserId = null;
            try {
              const lostOwnerRes = await pool.query(
                `SELECT reporter_id FROM items WHERE id = $1 LIMIT 1`,
                [lostId]
              );
              notificationUserId = lostOwnerRes.rows[0]?.reporter_id || null;
            } catch (ownerErr) {
              console.warn('⚠️ Failed to resolve lost item owner from DB, skipping notification fallback', ownerErr);
              notificationUserId = null;
            }

            if (notificationUserId) {
              try {
                await pool.query(
                  `INSERT INTO notifications (user_id, item_id, match_id, category, type)
                   VALUES ($1, $2, $3, $4, $5)`,
                  [
                    notificationUserId,
                    lostId,
                    matchId,
                    lostItem?.category || foundItem.category || null,
                    "match_found",
                  ]
                );
              } catch (notifErr) {
                console.error(
                  "⚠️ Failed to insert notification for match:",
                  notifErr
                );
              }

              if (io) {
                io.emit("newNotification", {
                  user_id: notificationUserId,
                  item_id: lostId,
                  match_id: matchId,
                  category: lostItem?.category || foundItem.category || null,
                  type: "match_found",
                });
              }
            }

            console.log(
              `💾 Search-created match ${matchId} between lost ${lostId} and found ${foundId}`
            );
          } catch (insertErr) {
            console.error("❌ Error inserting match from search:", insertErr);
          }
        }
      }
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error searching items:", err);
    res.status(500).json({ error: "Failed to search items" });
  }
});

/**
 * ✅ GET /api/items/:id
 * Fetch a single item by ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT i.*, 
        u_reporter.full_name AS reporter_name, 
        u_reporter.email AS reporter_email,
        u_reporter.contact_number AS reporter_contact,
        u_reporter.profile_picture AS reporter_profile_picture,
        u_reporter.id AS reporter_user_id,
        u_claimant.full_name AS claimant_name, 
        u_claimant.profile_picture AS claimant_profile_picture
      FROM items i
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN users u_claimant ON i.claimant_id = u_claimant.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = result.rows[0];
    console.log('📦 Item fetched with reporter data:', {
      item_id: item.id,
      reporter_name: item.reporter_name,
      reporter_email: item.reporter_email,
      reporter_contact: item.reporter_contact,
      reporter_id: item.reporter_id
    });

    res.json(item);
  } catch (err) {
    console.error("❌ Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

/**
 * ✅ POST /api/items
 * Add a new item (admin/manual insert)
 */
router.post("/", async (req, res) => {
  const {
    user_id,
    name,
    description,
    category,
    brand,
    color,
    location,
    type, // 'lost' or 'found'
    image_url,
    student_id,
    department,
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO items (
        user_id, name, description, category, brand, color, location, type, image_url, student_id, department, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        CASE WHEN $8 = 'found' THEN 'pending' ELSE 'reported_lost' END
      )
      RETURNING *;
      `,
      [
        user_id,
        name,
        description,
        category,
        brand,
        color,
        location,
        type,
        image_url,
        student_id,
        department,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding item:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

/**
 * ✅ PUT /api/items/:id
 * Update item details (e.g., status = 'claimed', 'resolved', etc.)
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    brand,
    color,
    location,
    status,
    type,
    image_url,
  } = req.body;

  try {
    // First, get the current item to check old status
    const currentItem = await pool.query(
      `SELECT status, reporter_id, type FROM items WHERE id = $1`,
      [id]
    );

    if (currentItem.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const oldStatus = currentItem.rows[0].status;
    const reporterId = currentItem.rows[0].reporter_id;
    const itemType = currentItem.rows[0].type;

    // Update the item
    const result = await pool.query(
      `
      UPDATE items
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        brand = COALESCE($4, brand),
        color = COALESCE($5, color),
        location = COALESCE($6, location),
        status = COALESCE($7, status),
        type = COALESCE($8, type),
        image_url = COALESCE($9, image_url),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *;
      `,
      [
        name,
        description,
        category,
        brand,
        color,
        location,
        status,
        type,
        image_url,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = result.rows[0];

    // ✅ If status changed to 'in_security_custody', create a notification for the reporter
    if (status === 'in_security_custody' && oldStatus !== 'in_security_custody' && reporterId && itemType === 'found') {
      try {
        const notificationResult = await pool.query(
          `
          INSERT INTO notifications (user_id, item_id, type, category, is_read, created_at)
          VALUES ($1, $2, 'item_received', 'delivery', FALSE, NOW())
          RETURNING *
          `,
          [reporterId, id]
        );

        const notification = notificationResult.rows[0];

        // Emit real-time notification via socket
        const io = req.app.get("io");
        if (io) {
          const payload = {
            notification_id: notification.id,
            item_id: id,
            item_name: updatedItem.name,
            item_category: updatedItem.category,
            item_student_id: updatedItem.student_id,
            message: "The item you delivered or turned over to the security office has been received successfully. Thank you for your cooperation.",
            timestamp: notification.created_at,
          };
          io.to(`user_${reporterId}`).emit("itemReceived", payload);
        }
      } catch (notificationErr) {
        console.error("⚠️ Error creating item received notification:", notificationErr);
      }
    }

    res.json({ message: "Item updated successfully", item: updatedItem });
  } catch (err) {
    console.error("❌ Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

/**
 * ✅ DELETE /api/items/:id
 * Delete an item (admin or item owner only)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      message: "Item deleted successfully",
      deletedItem: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
