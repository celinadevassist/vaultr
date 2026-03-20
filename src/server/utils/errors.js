function sendError(res, status, message, code, details) {
  const body = {
    error: message,
    code: code || 'INTERNAL_ERROR'
  };
  if (details !== undefined && details !== null) {
    body.details = details;
  }
  return res.status(status).json(body);
}

module.exports = { sendError };
