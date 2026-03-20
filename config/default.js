const path = require('path');

module.exports = {
  port: process.env.PORT || 3847,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiry: '15m',
    refreshExpiry: '7d'
  },
  db: {
    path: path.join(__dirname, '..', 'data')
  },
  presentations: {
    path: path.join(__dirname, '..', 'presentations')
  },
  uploads: {
    maxSize: 50 * 1024 * 1024, // 50MB
    path: path.join(__dirname, '..', 'presentations')
  },
  logs: {
    path: path.join(__dirname, '..', 'logs'),
    maxSize: '10m',
    maxFiles: 5
  },
  admin: {
    username: 'admin',
    email: 'admin@presentationhub.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!'
  }
};
