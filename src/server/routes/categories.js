const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// GET / - public list
router.get('/', async (req, res) => {
  try {
    const categories = await db.categories.find({});
    categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ categories });
  } catch (err) {
    logger.error('Error fetching categories', { error: err.message });
    return sendError(res, 500, 'Failed to fetch categories', 'INTERNAL_ERROR');
  }
});

// POST / - admin create
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, slug, description, primaryColor, accentColor, icon, chartStyle, fontFamily, sortOrder } = req.body;

    if (!name || !slug) {
      return sendError(res, 400, 'Name and slug are required', 'VALIDATION_ERROR');
    }

    const existing = await db.categories.findOne({ slug });
    if (existing) {
      return sendError(res, 409, 'A category with this slug already exists', 'VALIDATION_ERROR');
    }

    const now = new Date().toISOString();
    const category = {
      name,
      slug,
      description: description || '',
      primaryColor: primaryColor || '#6366f1',
      accentColor: accentColor || '#818cf8',
      icon: icon || 'folder',
      chartStyle: chartStyle || 'clean',
      fontFamily: fontFamily || 'Inter',
      sortOrder: sortOrder || 0,
      createdAt: now
    };

    const doc = await db.categories.insert(category);
    logger.info('Category created', { id: doc._id, slug });
    return res.status(201).json({ category: doc });
  } catch (err) {
    logger.error('Error creating category', { error: err.message });
    return sendError(res, 500, 'Failed to create category', 'INTERNAL_ERROR');
  }
});

// PUT /:id - admin update
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.categories.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Category not found', 'NOT_FOUND');
    }

    const updates = { ...req.body };
    delete updates._id;

    await db.categories.update({ _id: id }, { $set: updates });
    const updated = await db.categories.findOne({ _id: id });

    logger.info('Category updated', { id });
    return res.json({ category: updated });
  } catch (err) {
    logger.error('Error updating category', { error: err.message });
    return sendError(res, 500, 'Failed to update category', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - admin delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.categories.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Category not found', 'NOT_FOUND');
    }

    await db.categories.remove({ _id: id });
    logger.info('Category deleted', { id, slug: existing.slug });
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    logger.error('Error deleting category', { error: err.message });
    return sendError(res, 500, 'Failed to delete category', 'INTERNAL_ERROR');
  }
});

module.exports = router;
