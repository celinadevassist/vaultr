const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { scanPresentations } = require('../utils/scanner');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// POST /scan - admin only, trigger folder scan
router.post('/scan', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const results = await scanPresentations();
    logger.info('Manual presentation scan triggered', { resultCount: results.length });
    return res.json({ message: 'Scan complete', results });
  } catch (err) {
    logger.error('Error during manual scan', { error: err.message });
    return sendError(res, 500, 'Scan failed', 'INTERNAL_ERROR');
  }
});

module.exports = router;
