const { db } = require('../../database');

class StandardSeeder {
  static async run() {
    const count = await db.Standard.count();
    if (count > 0) {
      console.log('[SKIPPED] Standards table already has data');
      return;
    }

    const standards = [
      { name: '1st Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 1' },
      { name: '2nd Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 2' },
      { name: '3rd Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 3' },
      { name: '4th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 4' },
      { name: '5th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 5' },
      { name: '6th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 6' },
      { name: '7th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 7' },
      { name: '8th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 8' },
      { name: '9th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 9' },
      { name: '10th Standard (Gujarati Medium)', description: 'Gujarati medium - Standard 10 (SSC)' },
      { name: '11th Standard (Science)', description: 'Science stream - Standard 11' },
      { name: '12th Standard (Science)', description: 'Science stream - Standard 12 (HSC)' },
      { name: '11th Standard (Commerce)', description: 'Commerce stream - Standard 11' },
      { name: '12th Standard (Commerce)', description: 'Commerce stream - Standard 12 (HSC)' },
      { name: 'Pre-Primary (Nursery)', description: 'Nursery / Pre-school' },
      { name: 'Pre-Primary (KG)', description: 'Kindergarten (KG-1 & KG-2)' },
    ];

    await db.Standard.bulkCreate(standards);
    console.log(`[SEEDED] ${standards.length} standards created`);
  }
}

module.exports = StandardSeeder;
