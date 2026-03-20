const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// GET /me - current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.users.findOne({ _id: req.user.id });
    if (!user) {
      return sendError(res, 404, 'User not found', 'NOT_FOUND');
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    logger.error('Error fetching current user', { error: err.message });
    return sendError(res, 500, 'Failed to fetch user', 'INTERNAL_ERROR');
  }
});

// PUT /me - update own profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { displayName, email, password, avatar } = req.body;
    const updates = {};

    if (displayName !== undefined) updates.displayName = displayName;
    if (email !== undefined) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    if (password) {
      if (password.length < 6) {
        return sendError(res, 400, 'Password must be at least 6 characters', 'VALIDATION_ERROR');
      }
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields to update', 'VALIDATION_ERROR');
    }

    await db.users.update({ _id: req.user.id }, { $set: updates });
    const updated = await db.users.findOne({ _id: req.user.id });

    logger.info('User updated own profile', { userId: req.user.id });
    return res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    logger.error('Error updating own profile', { error: err.message });
    return sendError(res, 500, 'Failed to update profile', 'INTERNAL_ERROR');
  }
});

// GET / - admin list all users
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await db.users.find({});
    return res.json({ users: users.map(sanitizeUser) });
  } catch (err) {
    logger.error('Error fetching users', { error: err.message });
    return sendError(res, 500, 'Failed to fetch users', 'INTERNAL_ERROR');
  }
});

// POST / - admin create user
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { username, email, displayName, password, role, groups, avatar } = req.body;

    if (!username || !email || !password) {
      return sendError(res, 400, 'Username, email, and password are required', 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters', 'VALIDATION_ERROR');
    }

    const existingUsername = await db.users.findOne({ username });
    if (existingUsername) {
      return sendError(res, 409, 'Username already taken', 'VALIDATION_ERROR');
    }

    const existingEmail = await db.users.findOne({ email });
    if (existingEmail) {
      return sendError(res, 409, 'Email already in use', 'VALIDATION_ERROR');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const user = {
      username,
      email,
      displayName: displayName || username,
      passwordHash,
      role: role || 'viewer',
      groups: groups || [],
      avatar: avatar || '',
      isActive: true,
      createdAt: now,
      lastLogin: null
    };

    const doc = await db.users.insert(user);
    logger.info('User created by admin', { id: doc._id, username });
    return res.status(201).json({ user: sanitizeUser(doc) });
  } catch (err) {
    logger.error('Error creating user', { error: err.message });
    return sendError(res, 500, 'Failed to create user', 'INTERNAL_ERROR');
  }
});

// PUT /:id - admin update user
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.users.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'User not found', 'NOT_FOUND');
    }

    const updates = {};
    const { username, email, displayName, password, role, groups, avatar, isActive } = req.body;

    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (displayName !== undefined) updates.displayName = displayName;
    if (role !== undefined) updates.role = role;
    if (groups !== undefined) updates.groups = groups;
    if (avatar !== undefined) updates.avatar = avatar;
    if (isActive !== undefined) updates.isActive = isActive;

    if (password) {
      if (password.length < 6) {
        return sendError(res, 400, 'Password must be at least 6 characters', 'VALIDATION_ERROR');
      }
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields to update', 'VALIDATION_ERROR');
    }

    await db.users.update({ _id: id }, { $set: updates });
    const updated = await db.users.findOne({ _id: id });

    logger.info('User updated by admin', { id });
    return res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    logger.error('Error updating user', { error: err.message });
    return sendError(res, 500, 'Failed to update user', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - admin delete user
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.users.findOne({ _id: id });
    if (!existing) {
      return sendError(res, 404, 'User not found', 'NOT_FOUND');
    }

    await db.users.remove({ _id: id });
    logger.info('User deleted by admin', { id, username: existing.username });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    logger.error('Error deleting user', { error: err.message });
    return sendError(res, 500, 'Failed to delete user', 'INTERNAL_ERROR');
  }
});

module.exports = router;
