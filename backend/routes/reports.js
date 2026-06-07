const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const xlsx = require('xlsx');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/stock', async (req, res) => {
  const books = await db.Book.findAll({
    include: { model: db.Standard, attributes: ['name'] },
    order: [['title']],
  });
  res.json(books.map(b => {
    const j = b.toJSON();
    j.standard_name = j.Standard?.name || null;
    delete j.Standard;
    return j;
  }));
});

router.get('/sales', async (req, res) => {
  const where = {};
  if (req.query.from) where.sale_date = { [db.Op.gte]: req.query.from };
  if (req.query.to) where.sale_date = { ...where.sale_date, [db.Op.lte]: req.query.to };

  const sales = await db.Sale.findAll({
    where,
    include: { model: db.SaleItem, include: { model: db.Book, attributes: ['title'] } },
    order: [['created_at', 'DESC']],
  });

  const result = sales.map(s => {
    const j = s.toJSON();
    j.items = j.SaleItems?.map(i => {
      i.book_title = i.Book?.title || null;
      delete i.Book;
      return i;
    }) || [];
    delete j.SaleItems;
    return j;
  });

  res.json(result);
});

router.get('/purchases', async (req, res) => {
  const where = {};
  if (req.query.from) where.purchase_date = { [db.Op.gte]: req.query.from };
  if (req.query.to) where.purchase_date = { ...where.purchase_date, [db.Op.lte]: req.query.to };

  const purchases = await db.Purchase.findAll({
    where,
    include: [
      { model: db.Supplier, attributes: ['name'] },
      { model: db.PurchaseItem, include: { model: db.Book, attributes: ['title'] } },
    ],
    order: [['created_at', 'DESC']],
  });

  const result = purchases.map(p => {
    const j = p.toJSON();
    j.supplier_name = j.Supplier?.name || null;
    delete j.Supplier;
    j.items = j.PurchaseItems?.map(i => {
      i.book_title = i.Book?.title || null;
      delete i.Book;
      return i;
    }) || [];
    delete j.PurchaseItems;
    return j;
  });

  res.json(result);
});

router.get('/daily-summary', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const [sales] = await db.sequelize.query(
      'SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount),0) as total FROM sales WHERE sale_date = $1',
      { bind: [date], type: db.sequelize.QueryTypes.SELECT }
    );
    const [purchases] = await db.sequelize.query(
      'SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount),0) as total FROM purchases WHERE purchase_date = $1',
      { bind: [date], type: db.sequelize.QueryTypes.SELECT }
    );

    res.json({ date, sales, purchases });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/export/stock', async (req, res) => {
  const books = await db.Book.findAll({
    include: { model: db.Standard, attributes: ['name'] },
    order: [['title']],
    raw: true,
    nest: true,
  });

  const rows = books.map(b => ({
    'Book Title': b.title,
    'Author': b.author,
    'Publisher': b.publisher,
    'Standard': b.Standard?.name || '',
    'Price': b.price,
    'Stock': b.stock,
    'Barcode': b.barcode,
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, 'Stock');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=stock_report.xlsx');
  res.send(buf);
});

router.get('/export/sales', async (req, res) => {
  const sales = await db.Sale.findAll({
    attributes: [
      ['invoice_no', 'Invoice No'],
      ['sale_date', 'Date'],
      ['customer_name', 'Customer'],
      ['total_amount', 'Amount'],
      ['payment_method', 'Payment'],
    ],
    order: [['created_at', 'DESC']],
    raw: true,
  });

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(sales);
  xlsx.utils.book_append_sheet(wb, ws, 'Sales');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  res.send(buf);
});

router.get('/export/purchases', async (req, res) => {
  const purchases = await db.Purchase.findAll({
    include: { model: db.Supplier, attributes: ['name'] },
    order: [['created_at', 'DESC']],
    raw: true,
    nest: true,
  });

  const rows = purchases.map(p => ({
    'Invoice No': p.invoice_no,
    'Date': p.purchase_date,
    'Supplier': p.Supplier?.name || '',
    'Amount': p.total_amount,
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, 'Purchases');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=purchases_report.xlsx');
  res.send(buf);
});

module.exports = router;
