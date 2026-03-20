const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// GET /:presentationId - list current user's profiles for a presentation
router.get('/:presentationId', requireAuth, async (req, res) => {
  try {
    const { presentationId } = req.params;
    const profiles = await db.userPresentationData.find({
      userId: req.user.id,
      presentationId
    });
    profiles.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    return res.json({ profiles });
  } catch (err) {
    logger.error('Error fetching user profiles', { error: err.message });
    return sendError(res, 500, 'Failed to fetch profiles', 'INTERNAL_ERROR');
  }
});

// POST /:presentationId - save new profile
router.post('/:presentationId', requireAuth, async (req, res) => {
  try {
    const { presentationId } = req.params;
    const { profileName, data, isDefault } = req.body;

    if (!profileName) {
      return sendError(res, 400, 'Profile name is required', 'VALIDATION_ERROR');
    }

    // If this profile is set as default, unset other defaults
    if (isDefault) {
      await db.userPresentationData.update(
        { userId: req.user.id, presentationId, isDefault: true },
        { $set: { isDefault: false } },
        { multi: true }
      );
    }

    const now = new Date().toISOString();
    const profile = {
      userId: req.user.id,
      presentationId,
      profileName,
      data: data || {},
      isDefault: isDefault || false,
      createdAt: now,
      updatedAt: now
    };

    const doc = await db.userPresentationData.insert(profile);
    logger.info('User profile created', { userId: req.user.id, presentationId, profileId: doc._id });
    return res.status(201).json({ profile: doc });
  } catch (err) {
    logger.error('Error creating user profile', { error: err.message });
    return sendError(res, 500, 'Failed to create profile', 'INTERNAL_ERROR');
  }
});

// PUT /:id - update profile
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.userPresentationData.findOne({ _id: id, userId: req.user.id });
    if (!existing) {
      return sendError(res, 404, 'Profile not found', 'NOT_FOUND');
    }

    const { profileName, data, isDefault } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (profileName !== undefined) updates.profileName = profileName;
    if (data !== undefined) updates.data = data;
    if (isDefault !== undefined) {
      updates.isDefault = isDefault;
      if (isDefault) {
        await db.userPresentationData.update(
          { userId: req.user.id, presentationId: existing.presentationId, isDefault: true, _id: { $ne: id } },
          { $set: { isDefault: false } },
          { multi: true }
        );
      }
    }

    await db.userPresentationData.update({ _id: id }, { $set: updates });
    const updated = await db.userPresentationData.findOne({ _id: id });

    logger.info('User profile updated', { profileId: id });
    return res.json({ profile: updated });
  } catch (err) {
    logger.error('Error updating user profile', { error: err.message });
    return sendError(res, 500, 'Failed to update profile', 'INTERNAL_ERROR');
  }
});

// DELETE /:id - delete profile
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.userPresentationData.findOne({ _id: id, userId: req.user.id });
    if (!existing) {
      return sendError(res, 404, 'Profile not found', 'NOT_FOUND');
    }

    await db.userPresentationData.remove({ _id: id });
    logger.info('User profile deleted', { profileId: id });
    return res.json({ message: 'Profile deleted' });
  } catch (err) {
    logger.error('Error deleting user profile', { error: err.message });
    return sendError(res, 500, 'Failed to delete profile', 'INTERNAL_ERROR');
  }
});

module.exports = router;
