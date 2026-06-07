const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const where = {};
  if (req.query.from) where.sale_date = { [db.Op.gte]: req.query.from };
  if (req.query.to) where.sale_date = { ...where.sale_date, [db.Op.lte]: req.query.to };

  const sales = await db.Sale.findAll({ where, order: [['created_at', 'DESC']] });
  res.json(sales);
});

router.get('/:id', async (req, res) => {
  const sale = await db.Sale.findByPk(req.params.id, {
    include: { model: db.SaleItem, include: { model: db.Book, attributes: ['title', 'barcode'] } },
  });
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  const j = sale.toJSON();
  j.items = j.SaleItems?.map(i => {
    i.book_title = i.Book?.title || null;
    i.barcode = i.Book?.barcode || null;
    delete i.Book;
    return i;
  }) || [];
  delete j.SaleItems;
  res.json(j);
});

router.post('/', async (req, res) => {
  const { customer_name, customer_phone, sale_date, items, discount, payment_method } = req.body;
  if (!sale_date || !items?.length) {
    return res.status(400).json({ error: 'Date and items are required' });
  }

  const invoice_no = `INV-${Date.now()}`;
  const total_amount = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
  const discount_amount = discount || 0;

  try {
    const sale = await db.sequelize.transaction(async (t) => {
      for (const item of items) {
        const book = await db.Book.findByPk(item.book_id, { transaction: t });
        if (!book || book.stock < item.quantity) {
          throw new Error(`Insufficient stock for book ID ${item.book_id}`);
        }
      }

      const s = await db.Sale.create({
        customer_name, customer_phone, invoice_no, sale_date,
        total_amount: total_amount - discount_amount,
        discount: discount_amount || 0,
        payment_method: payment_method || 'cash',
      }, { transaction: t });

      for (const item of items) {
        await db.SaleItem.create({
          sale_id: s.id, book_id: item.book_id,
          quantity: item.quantity, unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        }, { transaction: t });
        await db.Book.decrement('stock', {
          by: item.quantity, where: { id: item.book_id }, transaction: t,
        });
      }
      return s;
    });

    res.status(201).json(sale);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  await db.sequelize.transaction(async (t) => {
    const items = await db.SaleItem.findAll({ where: { sale_id: req.params.id }, transaction: t });
    for (const item of items) {
      await db.Book.increment('stock', {
        by: item.quantity, where: { id: item.book_id }, transaction: t,
      });
    }
    await db.Sale.destroy({ where: { id: req.params.id }, transaction: t });
  });
  res.json({ message: 'Sale deleted and stock restored' });
});

module.exports = router;
