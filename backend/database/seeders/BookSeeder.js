const { db } = require('../../database');

class BookSeeder {
  static async run() {
    const count = await db.Book.count();
    if (count > 0) {
      console.log('[SKIPPED] Books table already has data');
      return;
    }

    const standards = await db.Standard.findAll({ raw: true });
    const getStdId = (name) => {
      const s = standards.find(st => st.name.includes(name));
      return s ? s.id : null;
    };

    const booksData = [
      { title: 'Gujarati (Sahyog) - Std 1', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '1st Standard', price: 65, cost: 50, stock: 120, barcode: '9780001001001' },
      { title: 'Mathematics (Sahyog) - Std 1', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '1st Standard', price: 70, cost: 52, stock: 100, barcode: '9780001001002' },
      { title: 'English (Sahyog) - Std 1', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '1st Standard', price: 75, cost: 55, stock: 90, barcode: '9780001001003' },
      { title: 'Hindi (Sahyog) - Std 1', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '1st Standard', price: 60, cost: 45, stock: 85, barcode: '9780001001004' },
      { title: 'Drawing Book - Std 1', author: 'Navneet', publisher: 'Navneet Education', standard: '1st Standard', price: 45, cost: 32, stock: 150, barcode: '9780001001005' },
      { title: 'Gujarati (Sahyog) - Std 2', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '2nd Standard', price: 70, cost: 52, stock: 110, barcode: '9780001002001' },
      { title: 'Mathematics (Sahyog) - Std 2', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '2nd Standard', price: 75, cost: 55, stock: 95, barcode: '9780001002002' },
      { title: 'English (Sahyog) - Std 2', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '2nd Standard', price: 80, cost: 58, stock: 88, barcode: '9780001002003' },
      { title: 'Hindi (Sahyog) - Std 2', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '2nd Standard', price: 65, cost: 48, stock: 82, barcode: '9780001002004' },
      { title: 'Gujarati (Sahyog) - Std 3', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '3rd Standard', price: 75, cost: 55, stock: 105, barcode: '9780001003001' },
      { title: 'Mathematics (Sahyog) - Std 3', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '3rd Standard', price: 80, cost: 58, stock: 92, barcode: '9780001003002' },
      { title: 'Science (Sahyog) - Std 3', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '3rd Standard', price: 85, cost: 62, stock: 78, barcode: '9780001003003' },
      { title: 'Social Science (Sahyog) - Std 3', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '3rd Standard', price: 70, cost: 50, stock: 74, barcode: '9780001003004' },
      { title: 'Gujarati (Sahyog) - Std 4', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '4th Standard', price: 80, cost: 58, stock: 98, barcode: '9780001004001' },
      { title: 'Mathematics (Sahyog) - Std 4', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '4th Standard', price: 85, cost: 62, stock: 86, barcode: '9780001004002' },
      { title: 'Science (Sahyog) - Std 4', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '4th Standard', price: 90, cost: 65, stock: 72, barcode: '9780001004003' },
      { title: 'Gujarati (Sahyog) - Std 5', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '5th Standard', price: 85, cost: 62, stock: 90, barcode: '9780001005001' },
      { title: 'Mathematics (Sahyog) - Std 5', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '5th Standard', price: 90, cost: 65, stock: 80, barcode: '9780001005002' },
      { title: 'Science (Sahyog) - Std 5', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '5th Standard', price: 95, cost: 68, stock: 68, barcode: '9780001005003' },
      { title: 'Social Science (Sahyog) - Std 5', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '5th Standard', price: 80, cost: 58, stock: 65, barcode: '9780001005004' },
      { title: 'Gujarati (Sahyog) - Std 6', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '6th Standard', price: 90, cost: 65, stock: 85, barcode: '9780001006001' },
      { title: 'Mathematics (Sahyog) - Std 6', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '6th Standard', price: 100, cost: 72, stock: 75, barcode: '9780001006002' },
      { title: 'Science (Sahyog) - Std 6', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '6th Standard', price: 105, cost: 75, stock: 70, barcode: '9780001006003' },
      { title: 'Social Science (Sahyog) - Std 6', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '6th Standard', price: 95, cost: 68, stock: 62, barcode: '9780001006004' },
      { title: 'Sanskrit (Sahyog) - Std 6', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '6th Standard', price: 75, cost: 55, stock: 55, barcode: '9780001006005' },
      { title: 'Gujarati (Sahyog) - Std 7', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '7th Standard', price: 95, cost: 68, stock: 80, barcode: '9780001007001' },
      { title: 'Mathematics (Sahyog) - Std 7', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '7th Standard', price: 105, cost: 75, stock: 72, barcode: '9780001007002' },
      { title: 'Science (Sahyog) - Std 7', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '7th Standard', price: 110, cost: 78, stock: 65, barcode: '9780001007003' },
      { title: 'Social Science (Sahyog) - Std 7', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '7th Standard', price: 100, cost: 72, stock: 58, barcode: '9780001007004' },
      { title: 'Gujarati (Sahyog) - Std 8', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '8th Standard', price: 100, cost: 72, stock: 76, barcode: '9780001008001' },
      { title: 'Mathematics (Sahyog) - Std 8', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '8th Standard', price: 110, cost: 78, stock: 68, barcode: '9780001008002' },
      { title: 'Science (Sahyog) - Std 8', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '8th Standard', price: 115, cost: 82, stock: 60, barcode: '9780001008003' },
      { title: 'Social Science (Sahyog) - Std 8', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '8th Standard', price: 105, cost: 75, stock: 55, barcode: '9780001008004' },
      { title: 'Sanskrit (Sahyog) - Std 8', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '8th Standard', price: 85, cost: 62, stock: 50, barcode: '9780001008005' },
      { title: 'Gujarati - Std 9', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '9th Standard', price: 110, cost: 78, stock: 70, barcode: '9780001009001' },
      { title: 'Mathematics - Std 9', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '9th Standard', price: 130, cost: 92, stock: 65, barcode: '9780001009002' },
      { title: 'Science - Std 9', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '9th Standard', price: 140, cost: 100, stock: 58, barcode: '9780001009003' },
      { title: 'Social Science - Std 9', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '9th Standard', price: 120, cost: 85, stock: 52, barcode: '9780001009004' },
      { title: 'Sanskrit - Std 9', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '9th Standard', price: 95, cost: 68, stock: 45, barcode: '9780001009005' },
      { title: 'Gujarati - Std 10', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '10th Standard', price: 120, cost: 85, stock: 65, barcode: '9780001010001' },
      { title: 'Mathematics - Std 10', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '10th Standard', price: 150, cost: 108, stock: 60, barcode: '9780001010002' },
      { title: 'Science - Std 10', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '10th Standard', price: 160, cost: 115, stock: 55, barcode: '9780001010003' },
      { title: 'Social Science - Std 10', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '10th Standard', price: 130, cost: 92, stock: 48, barcode: '9780001010004' },
      { title: 'Sanskrit - Std 10', author: 'Gujarat Rajya Shala Patrya Mandal', publisher: 'GSEB', standard: '10th Standard', price: 100, cost: 72, stock: 42, barcode: '9780001010005' },
      { title: 'Physics - Std 11 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Science)', price: 250, cost: 180, stock: 40, barcode: '9780001011001' },
      { title: 'Chemistry - Std 11 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Science)', price: 230, cost: 165, stock: 38, barcode: '9780001011002' },
      { title: 'Mathematics - Std 11 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Science)', price: 260, cost: 188, stock: 35, barcode: '9780001011003' },
      { title: 'Biology - Std 11 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Science)', price: 280, cost: 200, stock: 30, barcode: '9780001011004' },
      { title: 'Physics - Std 12 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Science)', price: 280, cost: 200, stock: 35, barcode: '9780001012001' },
      { title: 'Chemistry - Std 12 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Science)', price: 260, cost: 185, stock: 32, barcode: '9780001012002' },
      { title: 'Mathematics - Std 12 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Science)', price: 300, cost: 215, stock: 28, barcode: '9780001012003' },
      { title: 'Biology - Std 12 Science', author: 'NCERT/Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Science)', price: 320, cost: 230, stock: 25, barcode: '9780001012004' },
      { title: 'Accountancy - Std 11 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Commerce)', price: 220, cost: 158, stock: 35, barcode: '9780001011005' },
      { title: 'Economics - Std 11 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Commerce)', price: 200, cost: 145, stock: 30, barcode: '9780001011006' },
      { title: 'Business Studies - Std 11 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '11th Standard (Commerce)', price: 190, cost: 138, stock: 28, barcode: '9780001011007' },
      { title: 'Accountancy - Std 12 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Commerce)', price: 250, cost: 180, stock: 30, barcode: '9780001012005' },
      { title: 'Economics - Std 12 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Commerce)', price: 230, cost: 165, stock: 28, barcode: '9780001012006' },
      { title: 'Business Studies - Std 12 Commerce', author: 'Gujarat Board', publisher: 'GSEB', standard: '12th Standard (Commerce)', price: 210, cost: 152, stock: 25, barcode: '9780001012007' },
      { title: 'Long Notebook (172 Pages) - Unruled', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 85, cost: 60, stock: 200, barcode: '9780002000001' },
      { title: 'Long Notebook (172 Pages) - Ruled', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 85, cost: 60, stock: 180, barcode: '9780002000002' },
      { title: 'Small Notebook (100 Pages) - Ruled', author: 'Classmate', publisher: 'ITC', standard: null, price: 45, cost: 32, stock: 250, barcode: '9780002000003' },
      { title: 'Small Notebook (100 Pages) - Unruled', author: 'Classmate', publisher: 'ITC', standard: null, price: 45, cost: 32, stock: 220, barcode: '9780002000004' },
      { title: 'Drawing Notebook (56 Pages)', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 40, cost: 28, stock: 150, barcode: '9780002000005' },
      { title: 'Practical Notebook (100 Pages)', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 60, cost: 42, stock: 120, barcode: '9780002000006' },
      { title: 'Graph Notebook (100 Pages)', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 70, cost: 50, stock: 80, barcode: '9780002000007' },
      { title: 'Project Notebook (100 Pages)', author: 'Navneet', publisher: 'Navneet Education', standard: null, price: 65, cost: 46, stock: 90, barcode: '9780002000008' },
      { title: 'Geometry Box (Mathematical Instruments)', author: 'Camlin', publisher: 'Camlin', standard: null, price: 150, cost: 110, stock: 60, barcode: '9780003000001' },
      { title: 'Crayon Colors (12 shades)', author: 'Camlin', publisher: 'Camlin', standard: null, price: 65, cost: 45, stock: 100, barcode: '9780003000002' },
      { title: 'Water Colors (12 shades)', author: 'Camlin', publisher: 'Camlin', standard: null, price: 85, cost: 60, stock: 75, barcode: '9780003000003' },
      { title: 'Sketch Pens (12 shades)', author: 'Camlin', publisher: 'Camlin', standard: null, price: 95, cost: 68, stock: 80, barcode: '9780003000004' },
      { title: 'Pencil Pack (10 pcs)', author: 'Natraj', publisher: 'Natraj', standard: null, price: 50, cost: 35, stock: 150, barcode: '9780003000005' },
      { title: 'Eraser Pack (5 pcs)', author: 'Natraj', publisher: 'Natraj', standard: null, price: 25, cost: 18, stock: 200, barcode: '9780003000006' },
      { title: 'Sharpener (Double Hole)', author: 'Natraj', publisher: 'Natraj', standard: null, price: 15, cost: 10, stock: 250, barcode: '9780003000007' },
      { title: 'Scale (15 cm Plastic)', author: 'Camlin', publisher: 'Camlin', standard: null, price: 15, cost: 10, stock: 180, barcode: '9780003000008' },
      { title: 'School Bag (Junior)', author: 'Skybags', publisher: 'Skybags', standard: null, price: 450, cost: 320, stock: 30, barcode: '9780004000001' },
      { title: 'School Bag (Senior)', author: 'Skybags', publisher: 'Skybags', standard: null, price: 650, cost: 460, stock: 25, barcode: '9780004000002' },
      { title: 'Water Bottle (500 ml)', author: 'Milton', publisher: 'Milton', standard: null, price: 180, cost: 130, stock: 40, barcode: '9780004000003' },
      { title: 'Lunch Box (3-layer)', author: 'Cello', publisher: 'Cello', standard: null, price: 250, cost: 180, stock: 35, barcode: '9780004000004' },
    ];

    let bookCount = 0;
    for (const b of booksData) {
      await db.Book.create({
        title: b.title, author: b.author, publisher: b.publisher,
        standard_id: b.standard ? getStdId(b.standard) : null,
        price: b.price, cost_price: b.cost, stock: b.stock, barcode: b.barcode,
      });
      bookCount++;
    }
    console.log(`[SEEDED] ${bookCount} books created`);
  }
}

module.exports = BookSeeder;
