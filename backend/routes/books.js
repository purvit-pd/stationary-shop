const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const where = {};
  if (req.query.standard_id) where.standard_id = req.query.standard_id;
  if (req.query.stock_low === 'true') where.stock = { [db.Op.lte]: 5 };
  if (req.query.search) {
    const q = `%${req.query.search}%`;
    where[db.Op.or] = [
      { title: { [db.Op.iLike]: q } },
      { author: { [db.Op.iLike]: q } },
      { barcode: { [db.Op.iLike]: q } },
    ];
  }

  const books = await db.Book.findAll({
    where,
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

router.get('/:id', async (req, res) => {
  const book = await db.Book.findByPk(req.params.id, {
    include: { model: db.Standard, attributes: ['name'] },
  });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const j = book.toJSON();
  j.standard_name = j.Standard?.name || null;
  delete j.Standard;
  res.json(j);
});

router.get('/barcode/:barcode', async (req, res) => {
  const book = await db.Book.findOne({
    where: { barcode: req.params.barcode },
    include: { model: db.Standard, attributes: ['name'] },
  });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const j = book.toJSON();
  j.standard_name = j.Standard?.name || null;
  delete j.Standard;
  res.json(j);
});

router.post('/', async (req, res) => {
  const { title, author, publisher, standard_id, price, cost_price, stock, barcode } = req.body;
  if (!title || price === undefined) return res.status(400).json({ error: 'Title and price are required' });
  try {
    const book = await db.Book.create({
      title, author, publisher,
      standard_id: standard_id || null,
      price, cost_price: cost_price || 0,
      stock: stock || 0, barcode: barcode || null,
    });
    const j = book.toJSON();
    j.standard_name = null;
    res.status(201).json(j);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'Barcode already exists' });
    throw e;
  }
});

router.put('/:id', async (req, res) => {
  const book = await db.Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const { title, author, publisher, standard_id, price, cost_price, stock, barcode } = req.body;
  await book.update({
    title, author, publisher,
    standard_id: standard_id || null,
    price, cost_price: cost_price || 0,
    stock: stock || 0, barcode: barcode || null,
  });

  const updated = await db.Book.findByPk(req.params.id, {
    include: { model: db.Standard, attributes: ['name'] },
  });
  const j = updated.toJSON();
  j.standard_name = j.Standard?.name || null;
  delete j.Standard;
  res.json(j);
});

router.delete('/:id', async (req, res) => {
  const result = await db.Book.destroy({ where: { id: req.params.id } });
  if (result === 0) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted' });
});

module.exports = router;
