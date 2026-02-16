import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { runCleanup } from '../services/cleanupService.js';

const router = express.Router();

/**
 * @route GET /api/settings
 * @desc Get all public system settings
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM system_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value === 'true' ? true : row.value === 'false' ? false : row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/settings/cleanup
 * @desc Manually trigger cleanup of old returned reports
 * @access Private (Admin only)
 */
router.post('/cleanup', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { periodOverride, dryRun } = req.body;
    const result = await runCleanup({ periodOverride, dryRun });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.error('Manual cleanup error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route PATCH /api/settings/:key
 * @desc Update a specific setting
 * @access Private (Admin only)
 */
router.patch('/:key', authenticateJWT, async (req, res) => {
  try {
    // Basic role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(
      'UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *',
      [String(value), key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: `Setting ${key} updated successfully`, setting: result.rows[0] });
  } catch (err) {
    console.error('Error updating setting:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
