const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');
const config = require('../../../config/default');

const dbPath = config.db.path;

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const createStore = (name) => {
  return Datastore.create({
    filename: path.join(dbPath, `${name}.db`),
    autoload: true
  });
};

const db = {
  users: createStore('users'),
  presentations: createStore('presentations'),
  categories: createStore('categories'),
  groups: createStore('groups'),
  settings: createStore('settings'),
  userPresentationData: createStore('userPresentationData'),
  prds: createStore('prds'),
  sessions: createStore('sessions')
};

const ensureIndexes = async () => {
  await db.users.ensureIndex({ fieldName: 'username', unique: true });
  await db.users.ensureIndex({ fieldName: 'email', unique: true });
  await db.presentations.ensureIndex({ fieldName: 'slug', unique: true });
  await db.categories.ensureIndex({ fieldName: 'slug', unique: true });
  await db.groups.ensureIndex({ fieldName: 'slug', unique: true });
  await db.settings.ensureIndex({ fieldName: 'key', unique: true });
  await db.prds.ensureIndex({ fieldName: 'slug', unique: true });
  await db.sessions.ensureIndex({ fieldName: 'refreshToken' });
  await db.userPresentationData.ensureIndex({ fieldName: 'userId' });
  await db.userPresentationData.ensureIndex({ fieldName: 'presentationId' });
};

module.exports = { db, ensureIndexes };
