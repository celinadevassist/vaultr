const express = require('express');
const PDFDocument = require('pdfkit');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');
const { DEFAULT_PRD_SECTIONS, PRD_STATUS } = require('../../shared/constants');

const router = express.Router();

// GET / - admin list PRDs
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const prds = await db.prds.find(query);
    prds.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    return res.json({ prds });
  } catch (err) {
    logger.error('Error fetching PRDs', { error: err.message });
    return sendError(res, 500, 'Failed to fetch PRDs', 'INTERNAL_ERROR');
  }
});

// GET /:id - admin get single PRD
router.get('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const prd = await db.prds.findOne({ _id: req.params.id });
    if (!prd) {
      return sendError(res, 404, 'PRD not found', 'NOT_FOUND');
    }
    return res.json({ prd });
  } catch (err) {
    logger.error('Error fetching PRD', { error: err.message });
    return sendError(res, 500, 'Failed to fetch PRD', 'INTERNAL_ERROR');
  }
});

// POST / - admin create PRD
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { title, slug, version, status, category, sections, linkedPresentations, reviewers } = req.body;

    if (!title || !slug) {
      return sendError(res, 400, 'Title and slug are required', 'VALIDATION_ERROR');
    }

    const existing = await db.prds.findOne({ slug });
    if (existing) {
      return sendError(res, 409, 'A PRD with this slug already exists', 'VALIDATION_ERROR');
    }

    const now = new Date().toISOString();
    const prd = {
      title,
      slug,
      version: version || '1.0',
      status: status || PRD_STATUS.DRAFT,
      category: category || 'feature',
      sections: sections || DEFAULT_PRD_SECTIONS.map((s) => ({ ...s })),
      linkedPresentations: linkedPresentations || [],
      author: req.user.id,
      reviewers: reviewers || [],
      changelog: [
        { date: now, userId: req.user.id, summary: 'Initial draft' }
      ],
      createdAt: now,
      updatedAt: now
    };

    const doc = await db.prds.insert(prd);
    logger.info('PRD created', { id: doc._id, slug });
    return res.status(201).json({ prd: doc });
  } catch (err) {
    logger.error('Error creating PRD', { error: err.message });
    return sendError(res, 500, 'Failed to create PRD', 'INTERNAL_ERROR');
  }
});

// PUT /:id - admin update PRD
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.prds.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'PRD not found', 'NOT_FOUND');
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates._id;

    // Append to changelog if summary provided
    if (req.body.changelogEntry) {
      const entry = {
        date: new Date().toISOString(),
        userId: req.user.id,
        summary: req.body.changelogEntry
      };
      updates.changelog = [...(existing.changelog || []), entry];
      delete updates.changelogEntry;
    }

    await db.prds.update({ _id: id }, { $set: updates });
    const updated = await db.prds.findOne({ _id: id });

    logger.info('PRD updated', { id });
    return res.json({ prd: updated });
  } catch (err) {
    logger.error('Error updating PRD', { error: err.message });
    return sendError(res, 500, 'Failed to update PRD', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - admin delete PRD
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.prds.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'PRD not found', 'NOT_FOUND');
    }

    await db.prds.remove({ _id: id });
    logger.info('PRD deleted', { id, slug: existing.slug });
    return res.json({ message: 'PRD deleted' });
  } catch (err) {
    logger.error('Error deleting PRD', { error: err.message });
    return sendError(res, 500, 'Failed to delete PRD', 'INTERNAL_ERROR');
  }
});

// POST /:id/export - export PRD to PDF
router.post('/:id/export', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const prd = await db.prds.findOne({ _id: req.params.id });
    if (!prd) {
      return sendError(res, 404, 'PRD not found', 'NOT_FOUND');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      bufferPages: true
    });

    const filename = `${prd.slug}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header branding
    doc.fontSize(10).fillColor('#94a3b8').text('Presentation Hub', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor('#94a3b8').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });
    doc.moveDown(0.5);

    // Horizontal line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#6366f1').lineWidth(2).stroke();
    doc.moveDown(1);

    // Title
    doc.fontSize(24).fillColor('#0f172a').text(prd.title, { align: 'center' });
    doc.moveDown(0.5);

    // Metadata
    doc.fontSize(10).fillColor('#64748b');
    doc.text(`Version: ${prd.version}  |  Status: ${prd.status}  |  Category: ${prd.category}`, { align: 'center' });
    doc.moveDown(1.5);

    // Sections
    const sections = prd.sections || [];
    for (const section of sections) {
      // Section heading
      doc.fontSize(16).fillColor('#1e293b').text(section.heading, { underline: true });
      doc.moveDown(0.5);

      // Section content
      doc.fontSize(11).fillColor('#334155').text(section.content || '(No content)', {
        align: 'left',
        lineGap: 4
      });
      doc.moveDown(1);
    }

    // Changelog
    if (prd.changelog && prd.changelog.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#1e293b').text('Changelog', { underline: true });
      doc.moveDown(0.5);

      for (const entry of prd.changelog) {
        const date = new Date(entry.date).toLocaleDateString();
        doc.fontSize(10).fillColor('#475569').text(`${date}: ${entry.summary}`);
        doc.moveDown(0.3);
      }
    }

    doc.end();

    logger.info('PRD exported to PDF', { id: prd._id, slug: prd.slug });
  } catch (err) {
    logger.error('Error exporting PRD to PDF', { error: err.message });
    if (!res.headersSent) {
      return sendError(res, 500, 'Failed to export PRD', 'INTERNAL_ERROR');
    }
  }
});

module.exports = router;
