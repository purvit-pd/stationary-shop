const { initialize } = require('../../database');
const DatabaseSeeder = require('./DatabaseSeeder');

console.log('[DB] Initializing database schema...');
initialize().then(() => {
  DatabaseSeeder.run().then(() => {
    console.log('Seeding complete. You can now start the server with: npm start');
  });
});
