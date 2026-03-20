const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const config = require('../../../config/default');
const { db } = require('../db');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false
});

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// POST /login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, 'Username and password are required', 'VALIDATION_ERROR');
    }

    const user = await db.users.findOne({ username });
    if (!user) {
      return sendError(res, 401, 'Invalid credentials', 'AUTH_REQUIRED');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated', 'FORBIDDEN');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return sendError(res, 401, 'Invalid credentials', 'AUTH_REQUIRED');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await db.sessions.insert({
      userId: user._id,
      refreshToken: refreshHash,
      expiresAt,
      createdAt: now,
      revokedAt: null
    });

    await db.users.update({ _id: user._id }, { $set: { lastLogin: now } });

    logger.info('User logged in', { userId: user._id, username: user.username });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        groups: user.groups
      }
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    return sendError(res, 500, 'Login failed', 'INTERNAL_ERROR');
  }
});

// POST /refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required', 'VALIDATION_ERROR');
    }

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await db.sessions.findOne({ refreshToken: refreshHash, revokedAt: null });

    if (!session) {
      return sendError(res, 401, 'Invalid or revoked refresh token', 'AUTH_REQUIRED');
    }

    if (new Date(session.expiresAt) < new Date()) {
      return sendError(res, 401, 'Refresh token expired', 'TOKEN_EXPIRED');
    }

    const user = await db.users.findOne({ _id: session.userId });
    if (!user || !user.isActive) {
      return sendError(res, 401, 'User not found or inactive', 'AUTH_REQUIRED');
    }

    const accessToken = generateAccessToken(user);

    logger.info('Token refreshed', { userId: user._id });

    return res.json({ accessToken });
  } catch (err) {
    logger.error('Token refresh error', { error: err.message });
    return sendError(res, 500, 'Token refresh failed', 'INTERNAL_ERROR');
  }
});

// POST /logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required', 'VALIDATION_ERROR');
    }

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const now = new Date().toISOString();

    const numUpdated = await db.sessions.update(
      { refreshToken: refreshHash, revokedAt: null },
      { $set: { revokedAt: now } }
    );

    if (numUpdated === 0) {
      return sendError(res, 400, 'Session not found or already revoked', 'NOT_FOUND');
    }

    logger.info('User logged out');

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Logout error', { error: err.message });
    return sendError(res, 500, 'Logout failed', 'INTERNAL_ERROR');
  }
});

module.exports = router;
