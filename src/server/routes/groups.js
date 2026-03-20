const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// GET / - list groups (authenticated users can see groups)
router.get('/', requireAuth, async (req, res) => {
  try {
    const groups = await db.groups.find({});
    return res.json({ groups });
  } catch (err) {
    logger.error('Error fetching groups', { error: err.message });
    return sendError(res, 500, 'Failed to fetch groups', 'INTERNAL_ERROR');
  }
});

// POST / - admin create
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return sendError(res, 400, 'Name and slug are required', 'VALIDATION_ERROR');
    }

    const existing = await db.groups.findOne({ slug });
    if (existing) {
      return sendError(res, 409, 'A group with this slug already exists', 'VALIDATION_ERROR');
    }

    const now = new Date().toISOString();
    const group = {
      name,
      slug,
      description: description || '',
      createdAt: now
    };

    const doc = await db.groups.insert(group);
    logger.info('Group created', { id: doc._id, slug });
    return res.status(201).json({ group: doc });
  } catch (err) {
    logger.error('Error creating group', { error: err.message });
    return sendError(res, 500, 'Failed to create group', 'INTERNAL_ERROR');
  }
});

// PUT /:id - admin update
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.groups.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Group not found', 'NOT_FOUND');
    }

    const updates = { ...req.body };
    delete updates._id;

    await db.groups.update({ _id: id }, { $set: updates });
    const updated = await db.groups.findOne({ _id: id });

    logger.info('Group updated', { id });
    return res.json({ group: updated });
  } catch (err) {
    logger.error('Error updating group', { error: err.message });
    return sendError(res, 500, 'Failed to update group', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - admin delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.groups.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Group not found', 'NOT_FOUND');
    }

    await db.groups.remove({ _id: id });
    logger.info('Group deleted', { id, slug: existing.slug });
    return res.json({ message: 'Group deleted' });
  } catch (err) {
    logger.error('Error deleting group', { error: err.message });
    return sendError(res, 500, 'Failed to delete group', 'INTERNAL_ERROR');
  }
});

module.exports = router;
