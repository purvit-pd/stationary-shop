const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const returns = await db.Return.findAll({ order: [['created_at', 'DESC']] });
  res.json(returns);
});

router.get('/:id', async (req, res) => {
  const ret = await db.Return.findByPk(req.params.id, {
    include: { model: db.ReturnItem, include: { model: db.Book, attributes: ['title', 'barcode'] } },
  });
  if (!ret) return res.status(404).json({ error: 'Return not found' });
  const j = ret.toJSON();
  j.items = j.ReturnItems?.map(i => {
    i.book_title = i.Book?.title || null;
    i.barcode = i.Book?.barcode || null;
    delete i.Book;
    return i;
  }) || [];
  delete j.ReturnItems;
  res.json(j);
});

router.post('/', async (req, res) => {
  const { type, reference_id, return_date, items, reason } = req.body;
  if (!type || !reference_id || !return_date || !items?.length) {
    return res.status(400).json({ error: 'Type, reference, date, and items are required' });
  }

  const total_amount = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);

  const ret = await db.sequelize.transaction(async (t) => {
    const r = await db.Return.create({
      type, reference_id, return_date, total_amount, reason,
    }, { transaction: t });

    for (const item of items) {
      await db.ReturnItem.create({
        return_id: r.id, book_id: item.book_id,
        quantity: item.quantity, unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }, { transaction: t });

      if (type === 'purchase') {
        await db.Book.decrement('stock', {
          by: item.quantity, where: { id: item.book_id }, transaction: t,
        });
      } else {
        await db.Book.increment('stock', {
          by: item.quantity, where: { id: item.book_id }, transaction: t,
        });
      }
    }
    return r;
  });

  res.status(201).json(ret);
});

module.exports = router;
