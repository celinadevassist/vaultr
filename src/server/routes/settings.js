const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// GET / - public, returns site settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.settings.findOne({ key: 'site' });
    if (!settings) {
      return res.json({
        settings: {
          siteName: 'Presentation Hub',
          heroTitle: 'Master Business Topics Through Interactive Presentations',
          heroSubtitle: 'Curated, interactive presentations for marketing, sales, business, and more',
          ctaPrimary: 'Browse Presentations',
          ctaSecondary: 'Sign In',
          logoUrl: '',
          footerText: 'Presentation Hub 2026'
        }
      });
    }
    return res.json({ settings });
  } catch (err) {
    logger.error('Error fetching settings', { error: err.message });
    return sendError(res, 500, 'Failed to fetch settings', 'INTERNAL_ERROR');
  }
});

// PUT / - admin update
router.put('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates._id;
    delete updates.key;

    const existing = await db.settings.findOne({ key: 'site' });
    if (!existing) {
      const doc = await db.settings.insert({ key: 'site', ...updates });
      return res.json({ settings: doc });
    }

    await db.settings.update({ key: 'site' }, { $set: updates });
    const updated = await db.settings.findOne({ key: 'site' });

    logger.info('Site settings updated');
    return res.json({ settings: updated });
  } catch (err) {
    logger.error('Error updating settings', { error: err.message });
    return sendError(res, 500, 'Failed to update settings', 'INTERNAL_ERROR');
  }
});

module.exports = router;
