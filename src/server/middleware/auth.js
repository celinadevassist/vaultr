const jwt = require('jsonwebtoken');
const config = require('../../../config/default');
const { sendError } = require('../utils/errors');
const { db } = require('../db');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required', 'AUTH_REQUIRED');
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid token', 'AUTH_REQUIRED');
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
