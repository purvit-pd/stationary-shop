const bcrypt = require('bcryptjs');
const db = require('./models');

async function initialize() {
  await db.sequelize.authenticate();
  console.log('Database connected');

  await db.sequelize.sync({ alter: true });
  console.log('Tables synced');

  const existing = await db.User.findOne();
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.User.create({ name: 'Admin', email: 'admin@shop.com', password: hash, role: 'admin' });
    console.log('Default admin created: admin@shop.com / admin123');
  }
}

module.exports = { db, initialize };
