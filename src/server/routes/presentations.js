const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { checkVisibility } = require('../middleware/visibility');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../../../config/default');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const presentation = req.uploadPresentation;
    if (!presentation) {
      return cb(new Error('Presentation not found'));
    }
    const destDir = path.join(config.presentations.path, presentation.slug);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxSize }
});

// GET /public - no auth, only public presentations
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { visibility: 'public' };
    if (category) query.category = category;

    let presentations = await db.presentations.find(query);

    if (search) {
      const s = search.toLowerCase();
      presentations = presentations.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(s)))
      );
    }

    const total = presentations.length;
    const paginated = presentations.slice(skip, skip + limitNum);

    return res.json({ presentations: paginated, total, page: pageNum, limit: limitNum });
  } catch (err) {
    logger.error('Error fetching public presentations', { error: err.message });
    return sendError(res, 500, 'Failed to fetch presentations', 'INTERNAL_ERROR');
  }
});

// GET /featured - no auth, only featured
router.get('/featured', async (req, res) => {
  try {
    const presentations = await db.presentations.find({ featured: true, visibility: 'public' });
    presentations.sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
    return res.json({ presentations });
  } catch (err) {
    logger.error('Error fetching featured presentations', { error: err.message });
    return sendError(res, 500, 'Failed to fetch featured presentations', 'INTERNAL_ERROR');
  }
});

// GET / - list with pagination (optional auth for visibility filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, visibility } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (category) query.category = category;
    if (visibility) query.visibility = visibility;

    let presentations = await db.presentations.find(query);

    // Filter by access
    const user = req.user;
    if (!user) {
      presentations = presentations.filter((p) => p.visibility === 'public');
    } else if (user.role !== 'admin') {
      const userDoc = await db.users.findOne({ _id: user.id });
      const userGroups = (userDoc && userDoc.groups) || [];
      presentations = presentations.filter((p) => {
        if (p.visibility === 'public' || p.visibility === 'authenticated') return true;
        if (p.visibility === 'group') {
          return (p.allowedGroups || []).some((g) => userGroups.includes(g));
        }
        return false;
      });
    }

    if (search) {
      const s = search.toLowerCase();
      presentations = presentations.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(s)))
      );
    }

    const total = presentations.length;
    const paginated = presentations.slice(skip, skip + limitNum);

    return res.json({ presentations: paginated, total, page: pageNum, limit: limitNum });
  } catch (err) {
    logger.error('Error fetching presentations', { error: err.message });
    return sendError(res, 500, 'Failed to fetch presentations', 'INTERNAL_ERROR');
  }
});

// GET /:id - single presentation
router.get('/:id', optionalAuth, checkVisibility('id'), async (req, res) => {
  try {
    return res.json({ presentation: req.presentation });
  } catch (err) {
    logger.error('Error fetching presentation', { error: err.message });
    return sendError(res, 500, 'Failed to fetch presentation', 'INTERNAL_ERROR');
  }
});

// POST / - admin create
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { slug, title, description, category, visibility, allowedGroups, type, pageCount, featured, featuredOrder, entryFile, thumbnail, tags, prdId } = req.body;

    if (!slug || !title) {
      return sendError(res, 400, 'Slug and title are required', 'VALIDATION_ERROR');
    }

    if (title.length > 200) {
      return sendError(res, 400, 'Title must be 200 characters or less', 'VALIDATION_ERROR');
    }
    if (description && description.length > 2000) {
      return sendError(res, 400, 'Description must be 2000 characters or less', 'VALIDATION_ERROR');
    }

    const existing = await db.presentations.findOne({ slug });
    if (existing) {
      return sendError(res, 409, 'A presentation with this slug already exists', 'VALIDATION_ERROR');
    }

    const now = new Date().toISOString();
    const presentation = {
      slug,
      title,
      description: description || '',
      category: category || null,
      visibility: visibility || 'public',
      allowedGroups: allowedGroups || [],
      type: type || 'static',
      pageCount: pageCount || 1,
      featured: featured || false,
      featuredOrder: featuredOrder || 0,
      folderPath: path.join('presentations', slug),
      entryFile: entryFile || 'index.html',
      thumbnail: thumbnail || '',
      tags: tags || [],
      prdId: prdId || null,
      createdBy: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    const doc = await db.presentations.insert(presentation);
    logger.info('Presentation created', { id: doc._id, slug });

    return res.status(201).json({ presentation: doc });
  } catch (err) {
    logger.error('Error creating presentation', { error: err.message });
    return sendError(res, 500, 'Failed to create presentation', 'INTERNAL_ERROR');
  }
});

// PUT /:id - admin update
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.presentations.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Presentation not found', 'NOT_FOUND');
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates._id;

    if (updates.title && updates.title.length > 200) {
      return sendError(res, 400, 'Title must be 200 characters or less', 'VALIDATION_ERROR');
    }
    if (updates.description && updates.description.length > 2000) {
      return sendError(res, 400, 'Description must be 2000 characters or less', 'VALIDATION_ERROR');
    }

    await db.presentations.update({ _id: id }, { $set: updates });
    const updated = await db.presentations.findOne({ _id: id });

    logger.info('Presentation updated', { id });

    return res.json({ presentation: updated });
  } catch (err) {
    logger.error('Error updating presentation', { error: err.message });
    return sendError(res, 500, 'Failed to update presentation', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - admin delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.presentations.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'Presentation not found', 'NOT_FOUND');
    }

    await db.presentations.remove({ _id: id });
    logger.info('Presentation deleted', { id, slug: existing.slug });

    return res.json({ message: 'Presentation deleted' });
  } catch (err) {
    logger.error('Error deleting presentation', { error: err.message });
    return sendError(res, 500, 'Failed to delete presentation', 'INTERNAL_ERROR');
  }
});

// POST /:id/upload - admin file upload
router.post('/:id/upload', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const presentation = await db.presentations.findOne({ _id: req.params.id });
    if (!presentation) {
      return sendError(res, 404, 'Presentation not found', 'NOT_FOUND');
    }
    req.uploadPresentation = presentation;
    next();
  } catch (err) {
    return sendError(res, 500, 'Failed to prepare upload', 'INTERNAL_ERROR');
  }
}, upload.single('file'), (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No file uploaded', 'VALIDATION_ERROR');
  }

  logger.info('File uploaded to presentation', {
    presentationId: req.params.id,
    filename: req.file.originalname,
    size: req.file.size
  });

  return res.json({
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size
  });
});

module.exports = router;
