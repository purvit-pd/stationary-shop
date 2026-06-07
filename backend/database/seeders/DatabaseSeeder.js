const StandardSeeder = require('./StandardSeeder');
const BookSeeder = require('./BookSeeder');
const SupplierSeeder = require('./SupplierSeeder');
const TransactionSeeder = require('./TransactionSeeder');

class DatabaseSeeder {
  static async run() {
    console.log('\n========================================');
    console.log('   DATABASE SEEDER');
    console.log('========================================\n');

    const start = Date.now();

    try {
      await StandardSeeder.run();
      await BookSeeder.run();
      await SupplierSeeder.run();
      await TransactionSeeder.run();

      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`\n========================================`);
      console.log(`   All seeders completed in ${elapsed}s`);
      console.log(`========================================\n`);
    } catch (err) {
      console.error('\n[ERROR] Seeding failed:', err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  DatabaseSeeder.run();
}

module.exports = DatabaseSeeder;
