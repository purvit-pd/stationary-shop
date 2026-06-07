const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/summary', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [totalBooks, totalStock, totalSuppliers, lowStock, todaySales, totalSales, totalPurchases] =
    await Promise.all([
      db.Book.count(),
      db.Book.sum('stock'),
      db.Supplier.count(),
      db.Book.count({ where: { stock: { [db.Op.lte]: 5 } } }),
      db.Sale.sum('total_amount', { where: { sale_date: today } }),
      db.Sale.sum('total_amount'),
      db.Purchase.sum('total_amount'),
    ]);

  const [recentSales, lowStockBooks] = await Promise.all([
    db.Sale.findAll({ order: [['created_at', 'DESC']], limit: 5 }),
    db.Book.findAll({
      where: { stock: { [db.Op.lte]: 5 } },
      include: { model: db.Standard, attributes: ['name'] },
      order: [['stock']],
      limit: 5,
    }),
  ]);

  res.json({
    totalBooks,
    totalStock: totalStock || 0,
    totalSuppliers,
    lowStock,
    todaySales: todaySales || 0,
    totalSales: totalSales || 0,
    totalPurchases: totalPurchases || 0,
    recentSales,
    lowStockBooks: lowStockBooks.map(b => {
      const j = b.toJSON();
      j.standard_name = j.Standard?.name || null;
      delete j.Standard;
      return j;
    }),
  });
});

router.get('/sales-chart', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await db.sequelize.query(`
      SELECT sale_date as date, COUNT(*)::int as count, COALESCE(SUM(total_amount),0) as total
      FROM sales
      WHERE sale_date >= CURRENT_DATE - $1::interval
      GROUP BY sale_date
      ORDER BY sale_date
    `, {
      bind: [`${days} days`],
      type: db.sequelize.QueryTypes.SELECT,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/top-books', async (req, res) => {
  try {
    const books = await db.sequelize.query(`
      SELECT b.title, b.barcode, SUM(si.quantity)::int as total_sold, SUM(si.total_price) as total_revenue
      FROM sale_items si JOIN books b ON si.book_id = b.id
      GROUP BY si.book_id, b.title, b.barcode
      ORDER BY total_sold DESC
      LIMIT 10
    `, {
      type: db.sequelize.QueryTypes.SELECT,
    });
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
