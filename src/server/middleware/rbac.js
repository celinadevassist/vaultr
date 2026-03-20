const { sendError } = require('../utils/errors');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required', 'AUTH_REQUIRED');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Insufficient permissions', 'FORBIDDEN');
    }
    next();
  };
}

module.exports = { requireRole };
