import cron from 'node-cron';
import pool from '../db.js';
import fs from 'fs';
import path from 'path';

/**
 * Service to handle automatic cleanup of old returned reports
 */
export const initCleanupTask = (io) => {
  // Run every minute to check for expired retention periods
  // This ensures "2 minute" tests and custom monthly values work accurately
  cron.schedule('* * * * *', async () => {
    await runCleanup({ io });
  });
};

/**
 * The core cleanup logic that can be triggered by cron or manually
 * @param {Object} options Optional overrides (e.g. for testing)
 * @returns {Object} Result of the operation
 */
export const runCleanup = async (options = {}) => {
  const { periodOverride = null, dryRun = false, io = null } = options;
  
  try {
    // 1. Get settings
    const settingsRes = await pool.query(
      "SELECT key, value FROM system_settings WHERE key IN ('retention_enabled', 'retention_period')"
    );
    
    const settings = settingsRes.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    
    const isEnabled = String(settings.retention_enabled).toLowerCase() === 'true';
    const retentionPeriod = periodOverride || settings.retention_period || '2 months';
    
    console.log(`⏰ [Cleanup] Service check: Enabled=${isEnabled}, Period=${retentionPeriod}`);

    if (!isEnabled && !periodOverride) {
      return { success: true, message: 'Cleanup skipped (disabled)', deletedCount: 0 };
    }

    // Diagnostic query to see what items exist that MIGHT be candidates
    const debugItems = await pool.query(`
      SELECT id, status, name, 
             return_date,
             (NOW() - CAST($1 AS INTERVAL)) as threshold
      FROM items
      WHERE (status IN ('returned', 'marked_returned', 'claimed', 'confirmed_claim', 'delivered'))
        AND return_date IS NOT NULL
    `, [retentionPeriod]);

    if (debugItems.rowCount > 0) {
      console.log(`🔍 [Cleanup] Candidate Check:`);
      debugItems.rows.forEach(item => {
        const isCandidate = new Date(item.return_date) < new Date(item.threshold);
        console.log(`   - Item: ${item.name} (${item.status}) | Return Date: ${item.return_date} | Threshold: ${item.threshold} | Delete? ${isCandidate}`);
      });
    }

    const deleteQuery = `
      DELETE FROM items
      WHERE (status IN ('returned', 'marked_returned', 'claimed', 'confirmed_claim', 'delivered'))
        AND return_date IS NOT NULL
        AND return_date < (NOW() - CAST($1 AS INTERVAL))
      RETURNING id, image_url, name;
    `;

    console.log(`🔍 [Cleanup] Executing DELETE for items older than ${retentionPeriod}...`);

    if (dryRun) {
      const checkRes = await pool.query(
        `SELECT id, name FROM items 
         WHERE (status IN ('returned', 'marked_returned', 'claimed', 'confirmed_claim', 'delivered'))
           AND return_date IS NOT NULL
           AND return_date < (NOW() - CAST($1 AS INTERVAL))`,
        [retentionPeriod]
      );
      console.log(`🧪 [Cleanup - Dry Run] Would delete ${checkRes.rowCount} items.`);
      return { success: true, message: 'Dry run completed', deletedCount: checkRes.rowCount, items: checkRes.rows };
    }

    const result = await pool.query(deleteQuery, [retentionPeriod]);
    const deletedItems = result.rows;

    if (deletedItems.length > 0) {
      console.log(`✅ [Cleanup] Successfully deleted ${deletedItems.length} old reports. (Threshold: ${retentionPeriod})`);
      
      // 3. Cleanup associated files and notify clients
      for (const item of deletedItems) {
        // Broadcast deletion via socket so UI updates instantly
        if (io) {
          io.emit('reportDeleted', { id: item.id });
          console.log(`   📡 Broadcasted deletion for item: ${item.id}`);
        }

        if (item.image_url) {
          const filePath = path.join(process.cwd(), item.image_url);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`   🗑️ Deleted file: ${item.image_url}`);
            } catch (err) {
              console.error(`   ❌ Failed to delete file ${item.image_url}:`, err.message);
            }
          }
        }
      }
    } else {
      console.log('ℹ️ No items met the cleanup criteria.');
    }

    return { 
      success: true, 
      message: `Deleted ${deletedItems.length} items`, 
      deletedCount: deletedItems.length 
    };

  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    return { success: false, error: err.message };
  }
};
