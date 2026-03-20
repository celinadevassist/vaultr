const { db } = require('../db');
const { sendError } = require('../utils/errors');

function checkVisibility(presentationIdParam) {
  const paramName = presentationIdParam || 'id';

  return async (req, res, next) => {
    try {
      const presentationId = req.params[paramName];
      const presentation = await db.presentations.findOne({ _id: presentationId });

      if (!presentation) {
        return sendError(res, 404, 'Presentation not found', 'NOT_FOUND');
      }

      req.presentation = presentation;
      const visibility = presentation.visibility;
      const user = req.user;

      if (visibility === 'public') {
        return next();
      }

      if (!user) {
        return sendError(res, 401, 'Authentication required to view this presentation', 'AUTH_REQUIRED');
      }

      if (visibility === 'authenticated') {
        return next();
      }

      if (user.role === 'admin') {
        return next();
      }

      if (visibility === 'group') {
        const userDoc = await db.users.findOne({ _id: user.id });
        if (!userDoc) {
          return sendError(res, 401, 'User not found', 'AUTH_REQUIRED');
        }
        const userGroups = userDoc.groups || [];
        const allowedGroups = presentation.allowedGroups || [];
        const hasAccess = allowedGroups.some((g) => userGroups.includes(g));
        if (hasAccess) {
          return next();
        }
        return sendError(res, 403, 'You do not have access to this presentation', 'FORBIDDEN');
      }

      if (visibility === 'private') {
        return sendError(res, 403, 'This presentation is private', 'FORBIDDEN');
      }

      return sendError(res, 403, 'Access denied', 'FORBIDDEN');
    } catch (err) {
      return sendError(res, 500, 'Error checking presentation access', 'INTERNAL_ERROR');
    }
  };
}

module.exports = { checkVisibility };
