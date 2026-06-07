const { db } = require('../../database');

class TransactionSeeder {
  static async run() {
    const count = await db.Purchase.count();
    if (count > 0) {
      console.log('[SKIPPED] Transactions already have data');
      return;
    }

    const books = await db.Book.findAll({ raw: true });
    const suppliers = await db.Supplier.findAll({ raw: true });
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    await db.sequelize.transaction(async (t) => {
      for (let p = 1; p <= 3; p++) {
        const supplier = getRandom(suppliers);
        const invoiceNo = `PUR-${String(Date.now()).slice(-6)}${p}`;
        const purchaseDate = new Date(Date.now() - (3 - p) * 7 * 86400000).toISOString().split('T')[0];
        let total = 0;
        const items = [];

        const numItems = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numItems; i++) {
          const book = books[i + (p - 1) * 8] || books[Math.floor(Math.random() * books.length)];
          const qty = 10 + Math.floor(Math.random() * 20);
          total += qty * book.cost_price;
          items.push({ book_id: book.id, quantity: qty, unit_cost: book.cost_price, total_cost: qty * book.cost_price });
        }

        const purchase = await db.Purchase.create({
          supplier_id: supplier.id, invoice_no: invoiceNo, purchase_date: purchaseDate, total_amount: total,
        }, { transaction: t });

        for (const item of items) {
          await db.PurchaseItem.create({ purchase_id: purchase.id, ...item }, { transaction: t });
          await db.Book.increment('stock', { by: item.quantity, where: { id: item.book_id }, transaction: t });
        }
      }
    });
    console.log('[SEEDED] 3 sample purchases created');

    const customerNames = ['Rajesh Patel', 'Mitesh Shah', 'Kiran Desai', 'Jignesh Mehta', 'Pooja Joshi', 'Amit Trivedi', 'Neha Sharma', 'Suresh Gupta'];
    const paymentModes = ['cash', 'card', 'upi'];

    await db.sequelize.transaction(async (t) => {
      for (let s = 1; s <= 8; s++) {
        const saleDate = new Date(Date.now() - (8 - s) * 2 * 86400000).toISOString().split('T')[0];
        const invoiceNo = `INV-${String(Date.now()).slice(-6)}${s}`;
        let total = 0;
        const items = [];

        const numItems = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numItems; i++) {
          const book = getRandom(books);
          if (book.stock <= 0) continue;
          const maxQty = Math.min(3, book.stock);
          if (maxQty <= 0) continue;
          const qty = 1 + Math.floor(Math.random() * maxQty);
          total += qty * book.price;
          items.push({ book_id: book.id, quantity: qty, unit_price: book.price, total_price: qty * book.price });
        }

        if (items.length === 0) continue;

        const discount = s % 3 === 0 ? Math.round(total * 0.05 * 100) / 100 : 0;
        const grandTotal = total - discount;
        const customer = s <= 3 ? getRandom(customerNames) : null;
        const payment = getRandom(paymentModes);

        const sale = await db.Sale.create({
          customer_name: customer, customer_phone: null, invoice_no: invoiceNo,
          sale_date: saleDate, total_amount: grandTotal, discount, payment_method: payment,
        }, { transaction: t });

        for (const item of items) {
          await db.SaleItem.create({ sale_id: sale.id, ...item }, { transaction: t });
          await db.Book.decrement('stock', { by: item.quantity, where: { id: item.book_id }, transaction: t });
        }
      }
    });
    console.log('[SEEDED] 8 sample sales created');
  }
}

module.exports = TransactionSeeder;
