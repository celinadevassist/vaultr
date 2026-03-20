const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const router = express.Router();

// GET / - admin only analytics
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    // Total counts
    const totalUsers = await db.users.count({});
    const totalPresentations = await db.presentations.count({});
    const totalProfiles = await db.userPresentationData.count({});

    // Popular presentations: count userPresentationData grouped by presentationId
    const allProfileData = await db.userPresentationData.find({});
    const presentationCounts = {};
    for (const profile of allProfileData) {
      const pid = profile.presentationId;
      presentationCounts[pid] = (presentationCounts[pid] || 0) + 1;
    }

    const allPresentations = await db.presentations.find({});
    const presentationMap = {};
    for (const p of allPresentations) {
      presentationMap[p._id] = p;
    }

    const popularPresentations = Object.entries(presentationCounts)
      .map(([id, count]) => ({
        presentationId: id,
        title: presentationMap[id] ? presentationMap[id].title : 'Unknown',
        slug: presentationMap[id] ? presentationMap[id].slug : 'unknown',
        profileCount: count
      }))
      .sort((a, b) => b.profileCount - a.profileCount)
      .slice(0, 10);

    // Active users: users with lastLogin in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const allUsers = await db.users.find({});
    const activeUsers = allUsers.filter(
      (u) => u.lastLogin && u.lastLogin >= thirtyDaysAgo
    ).length;

    // Category distribution: count presentations per category
    const allCategories = await db.categories.find({});
    const categoryMap = {};
    for (const c of allCategories) {
      categoryMap[c._id] = c.name;
    }

    const categoryDistribution = {};
    for (const p of allPresentations) {
      const catName = p.category ? (categoryMap[p.category] || 'Uncategorized') : 'Uncategorized';
      categoryDistribution[catName] = (categoryDistribution[catName] || 0) + 1;
    }

    const categoryDistributionArray = Object.entries(categoryDistribution).map(([name, count]) => ({
      category: name,
      count
    }));

    return res.json({
      totalUsers,
      totalPresentations,
      totalProfiles,
      popularPresentations,
      activeUsers,
      categoryDistribution: categoryDistributionArray
    });
  } catch (err) {
    logger.error('Error computing analytics', { error: err.message });
    return sendError(res, 500, 'Failed to compute analytics', 'INTERNAL_ERROR');
  }
});

module.exports = router;
