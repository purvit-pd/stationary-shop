const { Sequelize, Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbUrl = process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || 'postgres'}:${encodeURIComponent(process.env.DB_PASSWORD || 'postgres')}@${process.env.DB_HOST || 'localhost'}:${parseInt(process.env.DB_PORT) || 5432}/${process.env.DB_NAME || 'stationery_shop'}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  define: { underscored: true },
  dialectOptions: {
    ssl: process.env.DATABASE_URL ? { require: true, rejectUnauthorized: false } : false,
  },
});

const db = { Op };

fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'))
  .forEach(f => {
    const model = require(path.join(__dirname, f))(sequelize);
    db[model.name] = model;
  });

Object.values(db).forEach(m => {
  if (m.associate) m.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
