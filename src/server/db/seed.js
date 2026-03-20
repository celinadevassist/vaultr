const bcrypt = require('bcryptjs');
const { db, ensureIndexes } = require('./index');
const logger = require('../utils/logger');
const { scanPresentations } = require('../utils/scanner');
const config = require('../../../config/default');

const DEFAULT_CATEGORIES = [
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Marketing strategies and campaigns',
    primaryColor: '#6366f1',
    accentColor: '#818cf8',
    icon: 'megaphone',
    chartStyle: 'gradient',
    fontFamily: 'Inter',
    sortOrder: 1
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business operations and strategy',
    primaryColor: '#0ea5e9',
    accentColor: '#38bdf8',
    icon: 'briefcase',
    chartStyle: 'clean',
    fontFamily: 'Inter',
    sortOrder: 2
  },
  {
    name: 'Sales',
    slug: 'sales',
    description: 'Sales techniques and pipeline management',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    icon: 'trending-up',
    chartStyle: 'bold',
    fontFamily: 'Inter',
    sortOrder: 3
  },
  {
    name: 'Pricing',
    slug: 'pricing',
    description: 'Pricing models and revenue optimization',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    icon: 'dollar-sign',
    chartStyle: 'comparison',
    fontFamily: 'Inter',
    sortOrder: 4
  },
  {
    name: 'Time Management',
    slug: 'time-management',
    description: 'Productivity and time optimization',
    primaryColor: '#8b5cf6',
    accentColor: '#a78bfa',
    icon: 'clock',
    chartStyle: 'timeline',
    fontFamily: 'Inter',
    sortOrder: 5
  }
];

async function seed() {
  await ensureIndexes();

  // Seed admin user
  const existingAdmin = await db.users.findOne({ username: config.admin.username });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(config.admin.password, salt);
    const now = new Date().toISOString();

    await db.users.insert({
      username: config.admin.username,
      email: config.admin.email,
      displayName: 'Administrator',
      passwordHash,
      role: 'admin',
      groups: [],
      avatar: '',
      isActive: true,
      createdAt: now,
      lastLogin: null
    });
    logger.info('Default admin user created', { username: config.admin.username });
    console.log(`[SEED] Admin user created - username: ${config.admin.username}, password: ${config.admin.password}`);
  } else {
    logger.debug('Admin user already exists, skipping');
  }

  // Seed categories
  const existingCategories = await db.categories.count({});
  if (existingCategories === 0) {
    const now = new Date().toISOString();
    for (const cat of DEFAULT_CATEGORIES) {
      await db.categories.insert({ ...cat, createdAt: now });
    }
    logger.info('Default categories created', { count: DEFAULT_CATEGORIES.length });
  } else {
    logger.debug('Categories already exist, skipping');
  }

  // Seed settings
  const existingSettings = await db.settings.findOne({ key: 'site' });
  if (!existingSettings) {
    const now = new Date().toISOString();
    await db.settings.insert({
      key: 'site',
      siteName: 'Presentation Hub',
      heroTitle: 'Master Business Topics Through Interactive Presentations',
      heroSubtitle: 'Curated, interactive presentations for marketing, sales, business, and more',
      ctaPrimary: 'Browse Presentations',
      ctaSecondary: 'Sign In',
      logoUrl: '',
      footerText: 'Presentation Hub 2026',
      updatedAt: now
    });
    logger.info('Default site settings created');
  } else {
    logger.debug('Site settings already exist, skipping');
  }

  // Scan presentations folder
  try {
    const scanResults = await scanPresentations();
    logger.info('Presentation folder scan complete', { results: scanResults });
  } catch (err) {
    logger.error('Presentation folder scan failed', { error: err.message });
  }
}

// Allow running directly: node src/server/db/seed.js
if (require.main === module) {
  seed()
    .then(() => {
      console.log('[SEED] Seeding complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED] Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
