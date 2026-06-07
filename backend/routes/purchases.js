const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const purchases = await db.Purchase.findAll({
    include: { model: db.Supplier, attributes: ['name'] },
    order: [['created_at', 'DESC']],
  });
  res.json(purchases.map(p => {
    const j = p.toJSON();
    j.supplier_name = j.Supplier?.name || null;
    delete j.Supplier;
    return j;
  }));
});

router.get('/:id', async (req, res) => {
  const purchase = await db.Purchase.findByPk(req.params.id, {
    include: [
      { model: db.Supplier, attributes: ['name'] },
      { model: db.PurchaseItem, include: { model: db.Book, attributes: ['title', 'barcode'] } },
    ],
  });
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
  const j = purchase.toJSON();
  j.supplier_name = j.Supplier?.name || null;
  delete j.Supplier;
  j.items = j.PurchaseItems?.map(i => {
    i.book_title = i.Book?.title || null;
    i.barcode = i.Book?.barcode || null;
    delete i.Book;
    return i;
  }) || [];
  delete j.PurchaseItems;
  res.json(j);
});

router.post('/', async (req, res) => {
  const { supplier_id, invoice_no, purchase_date, items } = req.body;
  if (!invoice_no || !purchase_date || !items?.length) {
    return res.status(400).json({ error: 'Invoice no, date, and items are required' });
  }

  const total_amount = items.reduce((s, i) => s + (i.quantity * i.unit_cost), 0);

  const purchase = await db.sequelize.transaction(async (t) => {
    const p = await db.Purchase.create({
      supplier_id: supplier_id || null, invoice_no, purchase_date, total_amount,
    }, { transaction: t });

    for (const item of items) {
      await db.PurchaseItem.create({
        purchase_id: p.id, book_id: item.book_id,
        quantity: item.quantity, unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
      }, { transaction: t });
      await db.Book.increment('stock', {
        by: item.quantity, where: { id: item.book_id }, transaction: t,
      });
    }
    return p;
  });

  res.status(201).json(purchase);
});

router.delete('/:id', async (req, res) => {
  await db.sequelize.transaction(async (t) => {
    const items = await db.PurchaseItem.findAll({ where: { purchase_id: req.params.id }, transaction: t });
    for (const item of items) {
      await db.Book.decrement('stock', {
        by: item.quantity, where: { id: item.book_id }, transaction: t,
      });
    }
    await db.Purchase.destroy({ where: { id: req.params.id }, transaction: t });
  });
  res.json({ message: 'Purchase deleted and stock adjusted' });
});

module.exports = router;
