const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const logger = require('./logger');
const config = require('../../../config/default');

async function scanPresentations() {
  const presentationsDir = config.presentations.path;
  const results = [];

  if (!fs.existsSync(presentationsDir)) {
    logger.warn('Presentations directory does not exist', { path: presentationsDir });
    return results;
  }

  const entries = fs.readdirSync(presentationsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const slug = entry.name;
    const metaPath = path.join(presentationsDir, slug, 'meta.json');

    if (!fs.existsSync(metaPath)) {
      logger.debug('No meta.json found in presentation folder', { slug });
      continue;
    }

    let meta;
    try {
      const raw = fs.readFileSync(metaPath, 'utf-8');
      meta = JSON.parse(raw);
    } catch (err) {
      logger.error('Failed to parse meta.json', { slug, error: err.message });
      continue;
    }

    const existing = await db.presentations.findOne({ slug });
    if (existing) {
      logger.debug('Presentation already registered', { slug });
      results.push({ slug, status: 'exists', id: existing._id });
      continue;
    }

    let categoryId = null;
    if (meta.category) {
      const cat = await db.categories.findOne({ slug: meta.category });
      if (cat) {
        categoryId = cat._id;
      } else {
        logger.warn('Category slug not found for presentation, setting category to null', {
          slug,
          categorySlug: meta.category
        });
      }
    }

    const now = new Date().toISOString();
    const presentation = {
      slug,
      title: meta.title || slug,
      description: meta.description || '',
      category: categoryId,
      visibility: 'public',
      allowedGroups: [],
      type: meta.type || 'static',
      pageCount: meta.pageCount || 1,
      featured: false,
      featuredOrder: 0,
      folderPath: path.join('presentations', slug),
      entryFile: meta.entryFile || 'index.html',
      thumbnail: meta.thumbnail || '',
      tags: meta.tags || [],
      prdId: null,
      createdBy: null,
      createdAt: now,
      updatedAt: now
    };

    const doc = await db.presentations.insert(presentation);
    logger.info('Auto-registered presentation from folder scan', { slug, id: doc._id });
    results.push({ slug, status: 'created', id: doc._id });
  }

  // Flag presentations in DB whose folders are missing
  const allPresentations = await db.presentations.find({});
  for (const pres of allPresentations) {
    const folderPath = path.join(config.presentations.path, pres.slug);
    if (!fs.existsSync(folderPath)) {
      logger.warn('Presentation folder missing for registered presentation', {
        slug: pres.slug,
        id: pres._id
      });
    }
  }

  return results;
}

module.exports = { scanPresentations };
