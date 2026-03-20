const fs = require('fs');
const path = require('path');

// Load .env from project root manually
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const express = require('express');
const cors = require('cors');
const config = require('../../config/default');
const logger = require('./utils/logger');
const { ensureIndexes } = require('./db');
const { seed } = require('./db/seed');

// Route imports
const authRoutes = require('./routes/auth');
const presentationsRoutes = require('./routes/presentations');
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');
const settingsRoutes = require('./routes/settings');
const prdsRoutes = require('./routes/prds');
const userDataRoutes = require('./routes/userData');
const analyticsRoutes = require('./routes/analytics');
const scannerRoutes = require('./routes/scanner');

const app = express();

// CORS
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: false }));
} else {
  app.use(cors());
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug('HTTP request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/presentations', presentationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/prds', prdsRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/scanner', scannerRoutes);

// Serve presentation files statically
const presentationsDir = config.presentations.path;
app.use('/presentation-files', express.static(presentationsDir));

// Serve individual presentation files at /api/presentations/:slug/files/*
app.use('/api/presentations/:slug/files', (req, res, next) => {
  const slug = req.params.slug;
  const filePath = path.join(presentationsDir, slug);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Presentation folder not found', code: 'NOT_FOUND' });
  }
  express.static(filePath)(req, res, next);
});

// In production, serve React build
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/presentation-files/')) {
        return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large', code: 'VALIDATION_ERROR' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 50MB)', code: 'VALIDATION_ERROR' });
  }
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// Ensure directories exist
const logsDir = config.logs.path;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const dataDir = config.db.path;
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Start server
async function start() {
  try {
    await ensureIndexes();
    logger.info('Database indexes ensured');

    await seed();
    logger.info('Seed data applied');

    const port = config.port;
    app.listen(port, () => {
      logger.info(`Presentation Hub server started on port ${port}`, {
        port,
        env: process.env.NODE_ENV || 'development'
      });
      console.log(`[SERVER] Presentation Hub running at http://localhost:${port}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    console.error('[SERVER] Fatal startup error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
