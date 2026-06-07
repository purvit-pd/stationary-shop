const { db } = require('../../database');

class SupplierSeeder {
  static async run() {
    const count = await db.Supplier.count();
    if (count > 0) {
      console.log('[SKIPPED] Suppliers table already has data');
      return;
    }

    await db.Supplier.bulkCreate([
      { name: 'Gujarat State Board Textbook Board', contact_person: 'Mr. Patel', phone: '9876543210', email: 'textbook@gseb.org', address: 'Gandhinagar, Gujarat', gstin: '24AAAAA1234A1Z5' },
      { name: 'Navneet Education Ltd.', contact_person: 'Mr. Mehta', phone: '9876543211', email: 'sales@navneet.com', address: 'Mumbai, Maharashtra', gstin: '27BBBBB5678B1Z5' },
      { name: 'Camlin Ltd.', contact_person: 'Mr. Shah', phone: '9876543212', email: 'order@camlin.co.in', address: 'Vadodara, Gujarat', gstin: '24CCCCC9012C1Z5' },
      { name: 'ITC Classmate', contact_person: 'Mrs. Desai', phone: '9876543213', email: 'classmate@itc.in', address: 'Ahmedabad, Gujarat', gstin: '24DDDDD3456D1Z5' },
      { name: 'Natraj Stationery', contact_person: 'Mr. Joshi', phone: '9876543214', email: 'info@natraj.in', address: 'Rajkot, Gujarat', gstin: '24EEEEE7890E1Z5' },
      { name: 'Surya Book Depot', contact_person: 'Mr. Suryavanshi', phone: '9876543215', email: 'suryabooks@yahoo.com', address: 'Surat, Gujarat', gstin: '24FFFFF1111F1Z5' },
      { name: 'Skybags India', contact_person: 'Mr. Kapoor', phone: '9876543216', email: 'sales@skybags.in', address: 'Mumbai, Maharashtra', gstin: '27GGGGG2222G1Z5' },
      { name: 'Milton Thermoplastics', contact_person: 'Mr. Agarwal', phone: '9876543217', email: 'orders@milton.in', address: 'Delhi', gstin: '07HHHHH3333H1Z5' },
    ]);
    console.log('[SEEDED] 8 suppliers created');
  }
}

module.exports = SupplierSeeder;
