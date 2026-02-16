import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createMatchNotification } from "../services/notificationService.js";
import { getEmbedding } from "../services/embeddingService.js";

const router = express.Router();

// ✅ Fuzzy matching function for item names
// Matches items if they share keywords (partial matching)
// More lenient: substring matching or keyword overlap
function fuzzyNameMatch(name1, name2) {
  if (!name1 || !name2) return false;
  
  const normalize = (str) => str.toLowerCase().trim();
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match (case-insensitive)
  if (n1 === n2) {
    console.log(`   ✅ Exact name match: "${name1}" = "${name2}"`);
    return true;
  }
  
  // Check if one is a substring of the other
  if (n1.includes(n2) || n2.includes(n1)) {
    console.log(`   ✅ Substring match: "${name1}" contains "${name2}"`);
    return true;
  }
  
  // Extract keywords (words/numbers of 2+ characters)
  const getKeywords = (str) => {
    return str
      .split(/[\s\-_]+/)
      .filter(word => word.length >= 2)
      .map(word => word.toLowerCase());
  };
  
  const keywords1 = getKeywords(n1);
  const keywords2 = getKeywords(n2);
  
  if (keywords1.length === 0 || keywords2.length === 0) {
    console.log(`   ❌ No keywords extracted from "${name1}" or "${name2}"`);
    return false;
  }
  
  // Check if all keywords from the shorter list are in the longer list
  const shorter = keywords1.length <= keywords2.length ? keywords1 : keywords2;
  const longer = keywords1.length <= keywords2.length ? keywords2 : keywords1;
  
  const match = shorter.every(keyword => longer.includes(keyword));
  if (match) {
    console.log(`   ✅ Keyword match: "${name1}" [${keywords1}] ✓ "${name2}" [${keywords2}]`);
  } else {
    console.log(`   ❌ No keyword match: "${name1}" [${keywords1}] ✗ "${name2}" [${keywords2}]`);
  }
  return match;
}

// ✅ Ensure uploads/items folder exists
const uploadDir = path.join(process.cwd(), "uploads", "items");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/**
 * ✅ POST /api/report
 * Save new report (lost/found item) linked to a user
 * + Emit real-time notification to security dashboard
 * + Perform automatic matching for ANY category
 * + Insert notification ONLY for the lost-item reporter
 * + Prevent duplicate match entries
 */
router.post("/report", upload.single("photo"), async (req, res) => {
  console.log("📥 POST /report received");
  try {
    const {
      name,
      student_id,
      course,
      department,
      brand,
      color,
      datetime,
      location,
      description,
      type,
      category,
      cover,
      reporter_id,
    } = req.body;

    console.log("📋 Request body received:");
    console.log("   - Type:", type);
    console.log("   - Category:", category);
    console.log("   - Reporter ID:", reporter_id);

    // ✅ Handle image upload
    const image_url = req.file ? `/uploads/items/${req.file.filename}` : null;

    // ✅ Use current timestamp if datetime is not provided or empty
    const reportDateTime = datetime && datetime.trim() ? datetime : new Date().toISOString();

    // ✅ Convert empty strings and undefined to null for optional fields
    const cleanParam = (val) => {
      if (!val) return null;
      if (typeof val === 'string' && !val.trim()) return null;
      return val;
    };

    const cleanedParams = {
      name: cleanParam(name),
      student_id: cleanParam(student_id),
      course: cleanParam(course),
      department: cleanParam(department),
      brand: cleanParam(brand),
      color: cleanParam(color),
      description: cleanParam(description),
      cover: cleanParam(cover),
      reporter_id: cleanParam(reporter_id),
    };

    // ✅ Fetch reporter info (including role) to check if staff/admin
    console.log(`🔍 Querying database for reporter_id: ${reporter_id}`);
    const reporter = await pool.query(
      `SELECT id, full_name, email, profile_picture, role
       FROM users 
       WHERE id = $1`,
      [reporter_id]
    );

    console.log(`📊 Database query result - rows: ${reporter.rows.length}`);
    
    if (!reporter.rows[0]) {
      console.error(`❌ Reporter not found for ID: ${reporter_id}`);
      return res.status(400).json({ error: "Reporter not found" });
    }

    const reporterRole = reporter.rows[0]?.role;
    const reporterName = reporter.rows[0]?.full_name;
    console.log(`👤 Reporter: ${reporterName} (ID: ${reporter_id})`);
    console.log(`🔑 Reporter Role from DB: "${reporterRole}" (type: ${typeof reporterRole})`);
    
    const isStaffReport = reporterRole === 'security' || reporterRole === 'admin';
    console.log(`✅ Is Staff Report? ${isStaffReport}`);
    console.log(`   - reporterRole === 'security': ${reporterRole === 'security'}`);
    console.log(`   - reporterRole === 'admin': ${reporterRole === 'admin'}`);

    // ✅ Determine status based on report type and reporter role
    let itemStatus = 'pending'; // Default status
    if (type === 'found' && isStaffReport) {
      itemStatus = 'in_security_custody'; // Auto-accept for staff found items
      console.log(`✅ Staff found item detected - auto-accepting with status: ${itemStatus}`);
    } else {
      console.log(`ℹ️ Regular user report - status: ${itemStatus} (Type: ${type}, IsStaff: ${isStaffReport})`);
    }

    // ✅ Insert item with reporter_id linked to users table
    console.log("🔍 DEBUG: About to insert with cleaned params:", [
      cleanedParams.name, cleanedParams.student_id, cleanedParams.course, cleanedParams.brand, cleanedParams.color, reportDateTime, location, cleanedParams.description, type, category, cleanedParams.cover, image_url, cleanedParams.reporter_id
    ]);
    console.log(`📋 FINAL VALUES - Type: ${type}, Status: ${itemStatus}, Accepted_at: ${itemStatus === 'in_security_custody' ? 'NOW' : 'NULL'}`);
    
    const result = await pool.query(
      `INSERT INTO items 
        (name, student_id, course, department, brand, color, datetime, location, description, type, category, cover, image_url, reporter_id, status, accepted_at)
       VALUES 
        ($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::TEXT, $7::TIMESTAMPTZ, $8::TEXT, $9::TEXT, $10::TEXT, $11::TEXT, $12::TEXT, $13::TEXT, $14::UUID, $15::TEXT, $16::TIMESTAMPTZ)
       RETURNING *`,
      [
        cleanedParams.name,
        cleanedParams.student_id,
        cleanedParams.course,
        cleanedParams.department,
        cleanedParams.brand,
        cleanedParams.color,
        reportDateTime,
        location,
        cleanedParams.description,
        type,
        category,
        cleanedParams.cover,
        image_url,
        cleanedParams.reporter_id,
        itemStatus,
        itemStatus === 'in_security_custody' ? new Date().toISOString() : null, // Auto-accept timestamp for staff
      ]
    );

    const newItem = result.rows[0];

    // ✅ Auto-generate embedding for general found items
    if (category === 'general' && type === 'found') {
      try {
        const textToEmbed = [
          newItem.name,
          newItem.brand,
          newItem.color,
          newItem.description
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (textToEmbed) {
          console.log(`⏳ Generating embedding for new found item: "${newItem.name}"...`);
          const embedding = await getEmbedding(textToEmbed);
          
          // Update item with embedding
          await pool.query(
            `UPDATE items SET embedding = $1::vector WHERE id = $2`,
            [JSON.stringify(embedding), newItem.id]
          );
          
          console.log(`✅ Successfully auto-generated embedding for: "${newItem.name}" (ID: ${newItem.id})`);
        }
      } catch (embeddingErr) {
        console.error(`❌ ERROR auto-generating embedding for item ${newItem.id}:`, embeddingErr.message);
        // Don't fail the request - item was created successfully
      }
    }

    // ✅ Combine item + reporter info
    const reportData = {
      ...newItem,
      reporter_name: reporter.rows[0]?.full_name || "Unknown",
      reporter_email: reporter.rows[0]?.email || "N/A",
      reporter_profile_picture: reporter.rows[0]?.profile_picture || null,
    };

    // ✅ MATCHING LOGIC: Perform automatic matching based on item type
    console.log(`\n📊 MATCHING LOGIC CHECK:`);
    console.log(`   - Item Type: ${type} (typeof: ${typeof type})`);
    console.log(`   - Item Status: ${itemStatus} (typeof: ${typeof itemStatus})`);
    console.log(`   - Condition check: type === 'lost' ? ${type === 'lost'}`);
    console.log(`   - Condition check: type === 'found' ? ${type === 'found'}`);
    console.log(`   - Condition check: itemStatus === 'in_security_custody' ? ${itemStatus === 'in_security_custody'}`);
    console.log(`   - Condition check: type === 'found' && itemStatus === 'in_security_custody' ? ${type === 'found' && itemStatus === 'in_security_custody'}`);
    
    if (type === 'lost') {
      // If this is a LOST item, check for matching FOUND items in security custody
      console.log(`\n🔍 Triggering exact match for lost item: ${newItem.name}`);
      
      // 🆔 ID NUMBER MATCHING - Check if found items match user's ID number
      if (newItem.student_id) {
        console.log(`\n📋 ID NUMBER MATCHING - Checking for found items with student_id: ${newItem.student_id}`);
        
        try {
          // Find users with matching ID number in their profile
          const userWithIdMatch = await pool.query(
            `SELECT id, full_name, email FROM users 
             WHERE id_number IS NOT NULL 
             AND LOWER(COALESCE(id_number, '')) = LOWER($1)
             LIMIT 1`,
            [newItem.student_id]
          );

          if (userWithIdMatch.rows.length > 0) {
            const matchedUser = userWithIdMatch.rows[0];
            console.log(`✅ USER FOUND WITH MATCHING ID NUMBER: "${newItem.student_id}" → User: ${matchedUser.full_name} (${matchedUser.id})`);
            
            // Check if a notification for this user about this item already exists
            const existingNotif = await pool.query(
              `SELECT * FROM notifications
               WHERE user_id = $1 
               AND category = 'id_number_match'
               AND item_id = $2`,
              [matchedUser.id, newItem.id]
            );

            if (existingNotif.rows.length === 0) {
              try {
                // Create notification to user whose ID number was found
                await createMatchNotification(pool, {
                  userId: matchedUser.id,
                  userEmail: matchedUser.email,
                  itemId: newItem.id,
                  matchId: null, // No match ID since this is user-profile-based matching
                  category: 'id_number_match',
                  matchDetails: {
                    itemName: newItem.name,
                    studentId: newItem.student_id,
                    department: newItem.department,
                    program: newItem.course,
                    itemType: newItem.type,
                    itemLocation: newItem.location,
                    reporterName: reporterName,
                    matchType: 'id_number',
                  }
                });
                console.log(`✅ ID Number notification sent to user ${matchedUser.id} (${matchedUser.email})`);
              } catch (notifError) {
                console.error(`❌ Failed to create ID number notification:`, notifError.message);
              }

              // Emit real-time notification to user
              const io = req.app.get("io");
              if (io) {
                const userRoom = `user_${matchedUser.id}`;
                io.to(userRoom).emit("newNotification", {
                  user_id: matchedUser.id,
                  item_id: newItem.id,
                  category: 'id_number_match',
                  type: "id_number_found",
                  message: `Your ID (${newItem.student_id}) has been found!`,
                });
                console.log(`🔔 Emitted ID number match notification to ${userRoom}`);
              }
            } else {
              console.log(`ℹ️ Notification already exists for this user and item`);
            }
          } else {
            console.log(`❌ No user found with ID number: ${newItem.student_id}`);
          }
        } catch (idNumberError) {
          console.error(`❌ Error during ID number matching:`, idNumberError);
        }
      }
      
      // SPECIAL HANDLING FOR ID ITEMS
      if (category === 'id' && newItem.student_id) {
        console.log(`\n🆔 ID ITEM DETECTED - Matching on Student ID: ${newItem.student_id}`);
        
        try {
          // For ID items, match on Student ID (primary key for identification)
          const matchQuery = await pool.query(
            `SELECT * FROM items
             WHERE type = 'found'
               AND category = 'id'
               AND status = 'in_security_custody'
               AND id != $1
               AND LOWER(COALESCE(student_id, '')) = LOWER($2)
             ORDER BY created_at ASC
             LIMIT 1`,
            [newItem.id, newItem.student_id]
          );

          if (matchQuery.rows.length > 0) {
            const foundItem = matchQuery.rows[0];
            console.log(`✅ ID MATCH FOUND: Lost ID with student_id "${newItem.student_id}" matched with Found ID ${foundItem.id}`);

            // Check if match already exists
            const existingMatch = await pool.query(
              `SELECT * FROM matches
               WHERE (lost_item_id = $1 AND found_item_id = $2)
                  OR (lost_item_id = $2 AND found_item_id = $1)`,
              [newItem.id, foundItem.id]
            );

            if (existingMatch.rows.length === 0) {
              // Insert match with 100% confidence for ID matches
              const matchInsert = await pool.query(
                `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
                 VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
                 RETURNING id`,
                [newItem.id, foundItem.id, 100.0]
              );

              const match_id = matchInsert.rows[0].id;
              console.log(`💾 ID Match created with 100% confidence (match_id: ${match_id})`);

              // Notify the found-item reporter
              const foundReporterInfo = await pool.query(
                `SELECT id, email FROM users WHERE id = $1`,
                [foundItem.reporter_id]
              );

              if (foundReporterInfo.rows.length > 0) {
                const userEmail = foundReporterInfo.rows[0].email;
                const matchDetails = {
                  itemName: newItem.name,
                  studentId: newItem.student_id,
                  department: newItem.department,
                  program: newItem.course,
                  itemType: newItem.type,
                  itemLocation: newItem.location,
                  matchedItemName: foundItem.name,
                  matchedStudentId: foundItem.student_id,
                  matchedType: foundItem.type,
                  matchedLocation: foundItem.location,
                  category: newItem.category,
                  matchId: match_id,
                };

                try {
                  await createMatchNotification(pool, {
                    userId: foundItem.reporter_id,
                    userEmail,
                    itemId: foundItem.id,
                    matchId: match_id,
                    category: newItem.category,
                    matchDetails
                  });
                  console.log(`✅ ID Match notification sent to found-item reporter (${foundItem.reporter_id})`);
                } catch (notifError) {
                  console.error(`❌ Failed to create notification:`, notifError.message);
                }

                // Emit real-time notification
                const io = req.app.get("io");
                if (io) {
                  const userRoom = `user_${foundItem.reporter_id}`;
                  io.to(userRoom).emit("newNotification", {
                    user_id: foundItem.reporter_id,
                    item_id: foundItem.id,
                    match_id,
                    category: newItem.category,
                    type: "match_found",
                  });
                  console.log(`🔔 Emitted newNotification to ${userRoom}`);
                }
              }
            } else {
              console.log(`ℹ️ ID Match already exists between these items`);
            }
          } else {
            console.log(`❌ No matching Found ID with student_id: ${newItem.student_id}`);
          }
        } catch (matchError) {
          console.error(`❌ Error during ID matching process:`, matchError);
        }
      } else {
        // GENERAL ITEM MATCHING (non-ID items)
        console.log(`   - Brand: ${newItem.brand}, Color: ${newItem.color}`);

      try {
        // Look for FOUND items matching on:
        // - Name: FUZZY match (primary criterion - must match)
        // - Brand: EXACT match if both have brand specified (case-insensitive)
        // - Color: EXACT match if both have color specified (case-insensitive)
        
        const matchQuery = await pool.query(
          `SELECT * FROM items
           WHERE type = 'found'
             AND status = 'in_security_custody'
             AND id != $1
           ORDER BY created_at ASC`,
          [newItem.id]
        );

        // Filter results using fuzzy name matching with brand/color validation
        let foundItem = null;
        console.log(`\n🔍 GENERAL ITEM MATCHING: Looking for lost item "${newItem.name}" (brand: ${newItem.brand}, color: ${newItem.color})`);
        console.log(`   Found ${matchQuery.rows.length} candidate items in security custody`);
        
        if (matchQuery.rows.length > 0) {
          for (const item of matchQuery.rows) {
            console.log(`\n   Checking found item "${item.name}" (brand: ${item.brand}, color: ${item.color})`);
            
            // First check: fuzzy name match (required)
            if (!fuzzyNameMatch(newItem.name, item.name)) {
              console.log(`   ❌ Name match failed`);
              continue;
            }
            
            console.log(`   ✅ Name match passed`);
            
            // Second check: if both items have brand specified, they must match exactly
            const hasBrand1 = newItem.brand && newItem.brand.trim();
            const hasBrand2 = item.brand && item.brand.trim();
            if (hasBrand1 && hasBrand2) {
              if (newItem.brand.toLowerCase() !== item.brand.toLowerCase()) {
                console.log(`   ❌ Brand mismatch: "${newItem.brand}" vs "${item.brand}"`);
                continue; // Brand mismatch, skip this item
              }
              console.log(`   ✅ Brand match: "${newItem.brand}"`);
            } else {
              console.log(`   ℹ️ Brand check skipped (missing on one or both)`);
            }
            
            // Third check: if both items have color specified, they must match exactly
            const hasColor1 = newItem.color && newItem.color.trim();
            const hasColor2 = item.color && item.color.trim();
            if (hasColor1 && hasColor2) {
              if (newItem.color.toLowerCase() !== item.color.toLowerCase()) {
                console.log(`   ❌ Color mismatch: "${newItem.color}" vs "${item.color}"`);
                continue; // Color mismatch, skip this item
              }
              console.log(`   ✅ Color match: "${newItem.color}"`);
            } else {
              console.log(`   ℹ️ Color check skipped (missing on one or both)`);
            }
            
            // All checks passed
            console.log(`✅ MATCH FOUND! Lost "${newItem.name}" matches Found "${item.name}"`);
            foundItem = item;
            break;
          }
        }
        
        if (!foundItem) {
          console.log(`❌ No matching found item for lost "${newItem.name}"`);
        }


        if (foundItem) {
          console.log(`✅ Found match: Found item ID=${foundItem.id}, name="${foundItem.name}" (fuzzy matched with "${newItem.name}")`);

          // Check if match already exists (avoid duplicates)
          const existingMatch = await pool.query(
            `SELECT * FROM matches
             WHERE (lost_item_id = $1 AND found_item_id = $2)
                OR (lost_item_id = $2 AND found_item_id = $1)`,
            [newItem.id, foundItem.id]
          );

          if (existingMatch.rows.length === 0) {
            // Insert new match
            const matchInsert = await pool.query(
              `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
               VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
               RETURNING id`,
              [newItem.id, foundItem.id, 100.0]
            );

            const match_id = matchInsert.rows[0].id;
            console.log(`💾 Match created (match_id: ${match_id})`);

            // Notify the found-item reporter
            const foundReporterInfo = await pool.query(
              `SELECT id, email FROM users WHERE id = $1`,
              [foundItem.reporter_id]
            );

            if (foundReporterInfo.rows.length > 0) {
              const userEmail = foundReporterInfo.rows[0].email;
              const matchDetails = {
                itemName: newItem.name,
                itemType: newItem.type,
                itemLocation: newItem.location,
                itemBrand: newItem.brand,
                itemColor: newItem.color,
                matchedItemName: foundItem.name,
                matchedType: foundItem.type,
                matchedLocation: foundItem.location,
                matchedBrand: foundItem.brand,
                matchedColor: foundItem.color,
                category: newItem.category,
                matchId: match_id,
              };

              try {
                await createMatchNotification(pool, {
                  userId: foundItem.reporter_id,
                  userEmail,
                  itemId: foundItem.id,
                  matchId: match_id,
                  category: newItem.category,
                  matchDetails
                });
                console.log(`✅ Notification sent to found-item reporter (${foundItem.reporter_id})`);
              } catch (notifError) {
                console.error(`❌ Failed to create notification:`, notifError.message);
              }

              // Emit real-time notification
              const io = req.app.get("io");
              if (io) {
                const userRoom = `user_${foundItem.reporter_id}`;
                io.to(userRoom).emit("newNotification", {
                  user_id: foundItem.reporter_id,
                  item_id: foundItem.id,
                  match_id,
                  category: newItem.category,
                  type: "match_found",
                });
                console.log(`🔔 Emitted newNotification to ${userRoom}`);
              }
            }
          } else {
            console.log(`ℹ️ Match already exists between these items`);
          }
        } else {
          console.log(`❌ No exact match found for: name=${newItem.name}, brand=${newItem.brand}, color=${newItem.color}`);
        }
      } catch (matchError) {
        console.error(`❌ Error during matching process:`, matchError);
        // Don't fail the report submission if matching fails
      }
      } // End of general item matching (else block)
    } else if (type === 'found' && itemStatus === 'in_security_custody') {
      // If this is a FOUND item being accepted into security custody (staff report), check for matching LOST items
      console.log(`\n✅ FOUND ITEM WITH IN_SECURITY_CUSTODY STATUS - TRIGGERING MATCH!`);
      console.log(`\n🔍 Triggering fuzzy match for found item: ${newItem.name}`);
      console.log(`📌 Found Item Details:`);
      console.log(`   - Type: ${newItem.type}`);
      console.log(`   - Category: ${newItem.category}`);
      console.log(`   - Student ID: ${newItem.student_id || 'NULL'}`);
      console.log(`   - Status: ${newItem.status}`);
      
      // SPECIAL HANDLING FOR ID ITEMS
      if (category === 'id' && newItem.student_id) {
        console.log(`\n🆔 ID ITEM DETECTED - Matching on Student ID: ${newItem.student_id}`);
        
        try {
          // For ID items, match on Student ID (primary key for identification)
          const matchQuery = await pool.query(
            `SELECT * FROM items
             WHERE type = 'lost'
               AND category = 'id'
               AND id != $1
               AND LOWER(COALESCE(student_id, '')) = LOWER($2)
             ORDER BY created_at ASC
             LIMIT 1`,
            [newItem.id, newItem.student_id]
          );

          if (matchQuery.rows.length > 0) {
            const lostItem = matchQuery.rows[0];
            console.log(`✅ ID MATCH FOUND: Found ID with student_id "${newItem.student_id}" matched with Lost ID ${lostItem.id}`);

            // Check if match already exists
            const existingMatch = await pool.query(
              `SELECT * FROM matches
               WHERE (lost_item_id = $1 AND found_item_id = $2)
                  OR (lost_item_id = $2 AND found_item_id = $1)`,
              [lostItem.id, newItem.id]
            );

            if (existingMatch.rows.length === 0) {
              // Insert match with 100% confidence for ID matches
              const matchInsert = await pool.query(
                `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
                 VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
                 RETURNING id`,
                [lostItem.id, newItem.id, 100.0]
              );

              const match_id = matchInsert.rows[0].id;
              console.log(`💾 ID Match created with 100% confidence (match_id: ${match_id})`);

              // Notify the lost-item reporter
              const lostReporterInfo = await pool.query(
                `SELECT id, email FROM users WHERE id = $1`,
                [lostItem.reporter_id]
              );

              if (lostReporterInfo.rows.length > 0) {
                const userEmail = lostReporterInfo.rows[0].email;
                const matchDetails = {
                  itemName: newItem.name,
                  studentId: newItem.student_id,
                  department: newItem.department,
                  program: newItem.course,
                  itemType: newItem.type,
                  itemLocation: newItem.location,
                  matchedItemName: lostItem.name,
                  matchedStudentId: lostItem.student_id,
                  matchedType: lostItem.type,
                  matchedLocation: lostItem.location,
                  category: newItem.category,
                  matchId: match_id,
                };

                try {
                  await createMatchNotification(pool, {
                    userId: lostItem.reporter_id,
                    userEmail,
                    itemId: lostItem.id,
                    matchId: match_id,
                    category: newItem.category,
                    matchDetails
                  });
                  console.log(`✅ ID Match notification sent to lost-item reporter (${lostItem.reporter_id})`);
                } catch (notifError) {
                  console.error(`❌ Failed to create notification:`, notifError.message);
                }

                // Emit real-time notification
                const io = req.app.get("io");
                if (io) {
                  const userRoom = `user_${lostItem.reporter_id}`;
                  io.to(userRoom).emit("newNotification", {
                    user_id: lostItem.reporter_id,
                    item_id: lostItem.id,
                    match_id,
                    category: newItem.category,
                    type: "match_found",
                  });
                  console.log(`🔔 Emitted newNotification to ${userRoom}`);
                }
              }
            } else {
              console.log(`ℹ️ ID Match already exists between these items`);
            }
          } else {
            console.log(`❌ No matching Lost ID with student_id: ${newItem.student_id}`);
          }
        } catch (matchError) {
          console.error(`❌ Error during ID matching process:`, matchError);
        }
      } else {
        // GENERAL ITEM MATCHING (non-ID items)
        console.log(`   - Brand: ${newItem.brand}, Color: ${newItem.color}`);

        try {
          // Look for LOST items matching on:
          // - Name: FUZZY match (primary criterion - must match)
          // - Brand: EXACT match if both have brand specified (case-insensitive)
          // - Color: EXACT match if both have color specified (case-insensitive)
          
          const matchQuery = await pool.query(
            `SELECT * FROM items
             WHERE type = 'lost'
               AND id != $1
             ORDER BY created_at ASC`,
            [newItem.id]
          );

          // Filter results using fuzzy name matching with brand/color validation
          let lostItem = null;
          console.log(`\n🔍 GENERAL ITEM MATCHING: Looking for match with found item "${newItem.name}" (brand: ${newItem.brand}, color: ${newItem.color})`);
          console.log(`   Found ${matchQuery.rows.length} candidate lost items`);
          
          if (matchQuery.rows.length > 0) {
            for (const item of matchQuery.rows) {
              console.log(`\n   Checking lost item "${item.name}" (brand: ${item.brand}, color: ${item.color})`);
              
              // First check: fuzzy name match (required)
              if (!fuzzyNameMatch(newItem.name, item.name)) {
                console.log(`   ❌ Name match failed`);
                continue;
              }
              
              console.log(`   ✅ Name match passed`);
              
              // Second check: if both items have brand specified, they must match exactly
              const hasBrand1 = newItem.brand && newItem.brand.trim();
              const hasBrand2 = item.brand && item.brand.trim();
              if (hasBrand1 && hasBrand2) {
                if (newItem.brand.toLowerCase() !== item.brand.toLowerCase()) {
                  console.log(`   ❌ Brand mismatch: "${newItem.brand}" vs "${item.brand}"`);
                  continue;
                }
                console.log(`   ✅ Brand match: "${newItem.brand}"`);
              } else {
                console.log(`   ℹ️ Brand check skipped (missing on one or both)`);
              }
              
              // Third check: if both items have color specified, they must match exactly
              const hasColor1 = newItem.color && newItem.color.trim();
              const hasColor2 = item.color && item.color.trim();
              if (hasColor1 && hasColor2) {
                if (newItem.color.toLowerCase() !== item.color.toLowerCase()) {
                  console.log(`   ❌ Color mismatch: "${newItem.color}" vs "${item.color}"`);
                  continue;
                }
                console.log(`   ✅ Color match: "${newItem.color}"`);
              } else {
                console.log(`   ℹ️ Color check skipped (missing on one or both)`);
              }
              
              // All checks passed
              console.log(`✅ MATCH FOUND! Found "${newItem.name}" matches Lost "${item.name}"`);
              lostItem = item;
              break;
            }
          }
          
          if (!lostItem) {
            console.log(`❌ No matching lost item for found "${newItem.name}"`);
          } else {
            console.log(`✅ Found fuzzy match: Lost item ID=${lostItem.id}, name="${lostItem.name}"`);

            // Check if match already exists (avoid duplicates)
            const existingMatch = await pool.query(
              `SELECT * FROM matches
               WHERE (lost_item_id = $1 AND found_item_id = $2)
                  OR (lost_item_id = $2 AND found_item_id = $1)`,
              [lostItem.id, newItem.id]
            );

            if (existingMatch.rows.length === 0) {
              // Insert new match
              const matchInsert = await pool.query(
                `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
                 VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
                 RETURNING id`,
                [lostItem.id, newItem.id, 100.0]
              );

              const match_id = matchInsert.rows[0].id;
              console.log(`💾 Match created (match_id: ${match_id})`);

              // Notify the lost-item reporter
              const lostReporterInfo = await pool.query(
                `SELECT id, email FROM users WHERE id = $1`,
                [lostItem.reporter_id]
              );

              if (lostReporterInfo.rows.length > 0) {
                const userEmail = lostReporterInfo.rows[0].email;
                const matchDetails = {
                  itemName: newItem.name,
                  itemType: newItem.type,
                  itemLocation: newItem.location,
                  itemBrand: newItem.brand,
                  itemColor: newItem.color,
                  matchedItemName: lostItem.name,
                  matchedType: lostItem.type,
                  matchedLocation: lostItem.location,
                  matchedBrand: lostItem.brand,
                  matchedColor: lostItem.color,
                  category: newItem.category,
                  matchId: match_id,
                };

                try {
                  await createMatchNotification(pool, {
                    userId: lostItem.reporter_id,
                    userEmail,
                    itemId: lostItem.id,
                    matchId: match_id,
                    category: newItem.category,
                    matchDetails
                  });
                  console.log(`✅ Notification sent to lost-item reporter (${lostItem.reporter_id})`);
                } catch (notifError) {
                  console.error(`❌ Failed to create notification:`, notifError.message);
                }

                // Emit real-time notification
                const io = req.app.get("io");
                if (io) {
                  const userRoom = `user_${lostItem.reporter_id}`;
                  io.to(userRoom).emit("newNotification", {
                    user_id: lostItem.reporter_id,
                    item_id: lostItem.id,
                    match_id,
                    category: newItem.category,
                    type: "match_found",
                  });
                  console.log(`🔔 Emitted newNotification to ${userRoom}`);
                }
              }
            } else {
              console.log(`ℹ️ Match already exists between these items`);
            }
          }
        } catch (matchError) {
          console.error(`❌ Error during matching process:`, matchError);
          // Don't fail the report submission if matching fails
        }
      }
      
      // 🆔 ID NUMBER MATCHING - Check if found item's student_id matches any user's profile ID number
      if (newItem.student_id) {
        console.log(`\n📋 ID NUMBER MATCHING - Checking if student_id matches any user's ID number: ${newItem.student_id}`);
        
        try {
          // Find users with matching ID number in their profile
          const userWithIdMatch = await pool.query(
            `SELECT id, full_name, email FROM users 
             WHERE id_number IS NOT NULL 
             AND LOWER(COALESCE(id_number, '')) = LOWER($1)
             LIMIT 1`,
            [newItem.student_id]
          );

          if (userWithIdMatch.rows.length > 0) {
            const matchedUser = userWithIdMatch.rows[0];
            console.log(`✅ USER FOUND WITH MATCHING ID NUMBER: "${newItem.student_id}" → User: ${matchedUser.full_name} (${matchedUser.id})`);
            
            // Check if a notification for this user about this item already exists
            const existingNotif = await pool.query(
              `SELECT * FROM notifications
               WHERE user_id = $1 
               AND category = 'id_number_match'
               AND item_id = $2`,
              [matchedUser.id, newItem.id]
            );

            if (existingNotif.rows.length === 0) {
              try {
                // Create notification to user whose ID number was found
                await createMatchNotification(pool, {
                  userId: matchedUser.id,
                  userEmail: matchedUser.email,
                  itemId: newItem.id,
                  matchId: null, // No match ID since this is user-profile-based matching
                  category: 'id_number_match',
                  matchDetails: {
                    itemName: newItem.name,
                    studentId: newItem.student_id,
                    department: newItem.department,
                    program: newItem.course,
                    itemType: newItem.type,
                    itemLocation: newItem.location,
                    reporterName: reporterName,
                    matchType: 'id_number',
                  }
                });
                console.log(`✅ ID Number notification sent to user ${matchedUser.id} (${matchedUser.email})`);
              } catch (notifError) {
                console.error(`❌ Failed to create ID number notification:`, notifError.message);
              }

              // Emit real-time notification to user
              const io = req.app.get("io");
              if (io) {
                const userRoom = `user_${matchedUser.id}`;
                io.to(userRoom).emit("newNotification", {
                  user_id: matchedUser.id,
                  item_id: newItem.id,
                  category: 'id_number_match',
                  type: "id_number_found",
                  message: `Your ID (${newItem.student_id}) has been found!`,
                });
                console.log(`🔔 Emitted ID number match notification to ${userRoom}`);
              }
            } else {
              console.log(`ℹ️ Notification already exists for this user and item`);
            }
          } else {
            console.log(`❌ No user found with ID number: ${newItem.student_id}`);
          }
        } catch (idNumberError) {
          console.error(`❌ Error during ID number matching:`, idNumberError);
        }
      } else {
        console.log(`⚠️ No student_id found in item, skipping ID number matching`);
      }
    }

    // ✅ Emit socket event to security dashboard
    const io = req.app.get("io");
    if (io) {
      io.emit("newReport", reportData);
      console.log("📢 Emitted newReport event:", reportData.name);
    }

    // ✅ Respond back to reporter
    res.status(201).json({
      message: "Report submitted successfully",
      data: reportData,
    });
  } catch (err) {
    console.error("❌ Error inserting report:", err);
    console.error("   Error code:", err.code);
    console.error("   Error message:", err.message);
    console.error("   Full error:", JSON.stringify(err, null, 2));
    
    // ✅ Provide more helpful error messages
    let errorMessage = "Failed to submit report";
    if (err.code === '22007') {
      errorMessage = "Invalid date/time format. Please check the date and time you entered.";
    } else if (err.code === '23502') {
      errorMessage = "Missing required information. Please ensure all required fields are filled.";
    } else if (err.code === '08006') {
      errorMessage = "Database connection lost. Please try again.";
    }
    
    res.status(500).json({ error: errorMessage, details: err.message });
  }
});

/**
 * ✅ GET /api/items
 * Retrieve all reported items (with reporter info)
 */
router.get("/items", async (req, res) => {
  const { user_id } = req.query;

  try {
    const params = [];
    let sql = `SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email, u.profile_picture AS reporter_profile_picture
       FROM items i
       LEFT JOIN users u ON i.reporter_id = u.id`;

    if (user_id) {
      params.push(user_id);
      sql += ` WHERE i.reporter_id = $${params.length}`;
    }

    sql += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/**
 * ✅ PUT /api/items/:id
 * Update item status (e.g., mark as returned/received)
 * When found items are accepted (status='received'), trigger exact matching
 */
router.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { status, claimant_name, claimant_student_id, claimant_phone_number } = req.body;

  try {
    const result = await pool.query(
      `UPDATE items SET
         status = $1,
         claimant_name = CASE WHEN TRIM(COALESCE($3, '')) != '' THEN TRIM($3) ELSE claimant_name END,
         claimant_student_id = CASE WHEN TRIM(COALESCE($4, '')) != '' THEN TRIM($4) ELSE claimant_student_id END,
         claimant_phone_number = CASE WHEN TRIM(COALESCE($5, '')) != '' THEN TRIM($5) ELSE claimant_phone_number END
       WHERE id = $2 RETURNING *`,
      [status, id, claimant_name, claimant_student_id, claimant_phone_number]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = result.rows[0];

    // ✅ MATCHING LOGIC: Trigger fuzzy matching when found item is accepted by security
    if (updatedItem.type === 'found' && status === 'in_security_custody') {
      console.log(`\n🔍 Triggering fuzzy match for found item: ${updatedItem.name}`);
      console.log(`   - Brand: ${updatedItem.brand}, Color: ${updatedItem.color}`);

      try {
        // Look for LOST items 
        const matchQuery = await pool.query(
          `SELECT * FROM items
           WHERE type = 'lost'
             AND id != $1
           ORDER BY created_at ASC`,
          [id]
        );

        // Filter using fuzzy name matching with brand/color validation
        let lostItem = null;
        console.log(`   Found ${matchQuery.rows.length} candidate lost items`);
        
        if (matchQuery.rows.length > 0) {
          for (const item of matchQuery.rows) {
            console.log(`\n   Checking lost item "${item.name}" (brand: ${item.brand}, color: ${item.color})`);
            
            // First check: fuzzy name match (required)
            if (!fuzzyNameMatch(updatedItem.name, item.name)) {
              console.log(`   ❌ Name match failed`);
              continue;
            }
            
            console.log(`   ✅ Name match passed`);
            
            // Second check: if both items have brand specified, they must match exactly
            const hasBrand1 = updatedItem.brand && updatedItem.brand.trim();
            const hasBrand2 = item.brand && item.brand.trim();
            if (hasBrand1 && hasBrand2) {
              if (updatedItem.brand.toLowerCase() !== item.brand.toLowerCase()) {
                console.log(`   ❌ Brand mismatch: "${updatedItem.brand}" vs "${item.brand}"`);
                continue;
              }
              console.log(`   ✅ Brand match: "${updatedItem.brand}"`);
            } else {
              console.log(`   ℹ️ Brand check skipped (missing on one or both)`);
            }
            
            // Third check: if both items have color specified, they must match exactly
            const hasColor1 = updatedItem.color && updatedItem.color.trim();
            const hasColor2 = item.color && item.color.trim();
            if (hasColor1 && hasColor2) {
              if (updatedItem.color.toLowerCase() !== item.color.toLowerCase()) {
                console.log(`   ❌ Color mismatch: "${updatedItem.color}" vs "${item.color}"`);
                continue;
              }
              console.log(`   ✅ Color match: "${updatedItem.color}"`);
            } else {
              console.log(`   ℹ️ Color check skipped (missing on one or both)`);
            }
            
            // All checks passed
            console.log(`✅ MATCH FOUND! Found "${updatedItem.name}" matches Lost "${item.name}"`);
            lostItem = item;
            break;
          }
        }
        
        if (!lostItem) {
          console.log(`❌ No matching lost item for found "${updatedItem.name}"`);
        } else {
          console.log(`✅ Found fuzzy match: Lost item ID=${lostItem.id}, name="${lostItem.name}"`);

          // Check if match already exists (avoid duplicates)
          const existingMatch = await pool.query(
            `SELECT * FROM matches
             WHERE (lost_item_id = $1 AND found_item_id = $2)
                OR (lost_item_id = $2 AND found_item_id = $1)`,
            [lostItem.id, updatedItem.id]
          );

          if (existingMatch.rows.length === 0) {
            // Insert new match
            const matchInsert = await pool.query(
              `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
               VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
               RETURNING id`,
              [lostItem.id, updatedItem.id, 100.0]
            );

            const match_id = matchInsert.rows[0].id;
            console.log(`💾 Match created (match_id: ${match_id})`);

            // Notify the lost-item reporter
            const lostReporterInfo = await pool.query(
              `SELECT id, email FROM users WHERE id = $1`,
              [lostItem.reporter_id]
            );

            if (lostReporterInfo.rows.length > 0) {
              const userEmail = lostReporterInfo.rows[0].email;
              const matchDetails = {
                itemName: lostItem.name,
                itemType: lostItem.type,
                itemLocation: lostItem.location,
                itemBrand: lostItem.brand,
                itemColor: lostItem.color,
                matchedItemName: updatedItem.name,
                matchedType: updatedItem.type,
                matchedLocation: updatedItem.location,
                matchedBrand: updatedItem.brand,
                matchedColor: updatedItem.color,
                category: lostItem.category,
                matchId: match_id,
              };

              try {
                await createMatchNotification(pool, {
                  userId: lostItem.reporter_id,
                  userEmail,
                  itemId: lostItem.id,
                  matchId: match_id,
                  category: lostItem.category,
                  matchDetails
                });
                console.log(`✅ Notification sent to lost-item reporter (${lostItem.reporter_id})`);
            console.log(`✅ Notification sent to lost-item reporter (${lostItem.reporter_id})`);
              } catch (notifError) {
                console.error(`❌ Failed to create notification:`, notifError.message);
              }

              // Emit real-time notification
              const io = req.app.get("io");
              if (io) {
                const userRoom = `user_${lostItem.reporter_id}`;
                io.to(userRoom).emit("newNotification", {
                  user_id: lostItem.reporter_id,
                  item_id: lostItem.id,
                  match_id,
                  category: lostItem.category,
                  type: "match_found",
                });
                console.log(`🔔 Emitted newNotification to ${userRoom}`);
              }
            }
          } else {
            console.log(`ℹ️ Match already exists between these items`);
          }
        }
      } catch (matchError) {
        console.error(`❌ Error during matching process:`, matchError);
        // Don't fail the status update if matching fails
      }

      // 🆔 ID NUMBER MATCHING - Check if found item's student_id matches any user's profile ID number
      if (updatedItem.student_id) {
        console.log(`\n📋 ID NUMBER MATCHING - Checking if student_id matches any user's ID number: ${updatedItem.student_id}`);
        
        try {
          // Find users with matching ID number in their profile
          const userWithIdMatch = await pool.query(
            `SELECT id, full_name, email FROM users 
             WHERE id_number IS NOT NULL 
             AND LOWER(COALESCE(id_number, '')) = LOWER($1)
             LIMIT 1`,
            [updatedItem.student_id]
          );

          if (userWithIdMatch.rows.length > 0) {
            const matchedUser = userWithIdMatch.rows[0];
            console.log(`✅ USER FOUND WITH MATCHING ID NUMBER: "${updatedItem.student_id}" → User: ${matchedUser.full_name} (${matchedUser.id})`);
            
            // Check if a notification for this user about this item already exists
            const existingNotif = await pool.query(
              `SELECT * FROM notifications
               WHERE user_id = $1 
               AND category = 'id_number_match'
               AND item_id = $2`,
              [matchedUser.id, updatedItem.id]
            );

            if (existingNotif.rows.length === 0) {
              try {
                // Create notification to user whose ID number was found
                await createMatchNotification(pool, {
                  userId: matchedUser.id,
                  userEmail: matchedUser.email,
                  itemId: updatedItem.id,
                  matchId: null, // No match ID since this is user-profile-based matching
                  category: 'id_number_match',
                  matchDetails: {
                    itemName: updatedItem.name,
                    studentId: updatedItem.student_id,
                    department: updatedItem.department,
                    program: updatedItem.course,
                    itemType: updatedItem.type,
                    itemLocation: updatedItem.location,
                    matchType: 'id_number',
                  }
                });
                console.log(`✅ ID Number notification sent to user ${matchedUser.id} (${matchedUser.email})`);
              } catch (notifError) {
                console.error(`❌ Failed to create ID number notification:`, notifError.message);
              }

              // Emit real-time notification to user
              const io = req.app.get("io");
              if (io) {
                const userRoom = `user_${matchedUser.id}`;
                io.to(userRoom).emit("newNotification", {
                  user_id: matchedUser.id,
                  item_id: updatedItem.id,
                  category: 'id_number_match',
                  type: "id_number_found",
                  message: `Your ID (${updatedItem.student_id}) has been found!`,
                });
                console.log(`🔔 Emitted ID number match notification to ${userRoom}`);
              }
            } else {
              console.log(`ℹ️ Notification already sent to user for this item`);
            }
          } else {
            console.log(`❌ No user found with ID number: ${updatedItem.student_id}`);
          }
        } catch (idMatchError) {
          console.error(`❌ Error during ID number matching:`, idMatchError);
          // Don't fail the status update if ID matching fails
        }
      }
    }

    // ✅ Emit real-time update
    const io = req.app.get("io");
    if (io) io.emit("reportUpdated", updatedItem);

    res.status(200).json({
      message: "Item status updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/**
 * ✅ DELETE /api/items/:id
 * Delete an item/report by ID
 */
router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  const deletedItems = [];
  const deletedIds = new Set();

  const rememberDeleted = (item) => {
    if (!item || !item.id || deletedIds.has(item.id)) return;
    deletedIds.add(item.id);
    deletedItems.push({ id: item.id, image_url: item.image_url });
  };

  const deleteItemCascade = async (item, collectCounterparts = false) => {
    rememberDeleted(item);

    const matchRes = await client.query(
      "SELECT id, lost_item_id, found_item_id FROM matches WHERE lost_item_id = $1 OR found_item_id = $1",
      [item.id]
    );

    const counterpartIds = collectCounterparts
      ? matchRes.rows
          .map((row) =>
            row.lost_item_id === item.id ? row.found_item_id : row.lost_item_id
          )
          .filter(Boolean)
      : [];

    const matchIds = matchRes.rows.map((row) => row.id);
    if (matchIds.length > 0) {
      await client.query(
        "DELETE FROM notifications WHERE match_id = ANY($1::uuid[])",
        [matchIds]
      );
      await client.query("DELETE FROM matches WHERE id = ANY($1::uuid[])", [
        matchIds,
      ]);
    }

    await client.query("DELETE FROM notifications WHERE item_id = $1", [
      item.id,
    ]);
    await client.query("DELETE FROM claims WHERE item_id = $1", [item.id]);
    await client.query("DELETE FROM items WHERE id = $1", [item.id]);

    return counterpartIds;
  };

  try {
    await client.query("BEGIN");

    const itemRes = await client.query("SELECT * FROM items WHERE id = $1", [
      id,
    ]);
    if (itemRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Item not found" });
    }

  const item = itemRes.rows[0];
  const shouldCascade = false; // We disabled cascading deletions to prevent losing matched reports

    const counterpartIds = await deleteItemCascade(item, shouldCascade);

    await client.query("COMMIT");

    const io = req.app.get("io");
    if (io) {
      deletedIds.forEach((deletedId) =>
        io.emit("reportDeleted", { id: deletedId })
      );
    }

    for (const removed of deletedItems) {
      if (!removed.image_url) continue;
      const imagePath = path.join(process.cwd(), removed.image_url);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (fileErr) {
          console.error("⚠️ Failed to remove image during deletion:", fileErr);
        }
      }
    }

    res.status(200).json({
      message: "Report deleted successfully",
      deleted_ids: Array.from(deletedIds),
      cascade: shouldCascade,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error deleting report:", err);
    res.status(500).json({ error: "Failed to delete report" });
  } finally {
    client.release();
  }
});

export default router;
