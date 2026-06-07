const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const standards = await db.Standard.findAll({ order: [['name']] });
  res.json(standards);
});

router.get('/:id', async (req, res) => {
  const standard = await db.Standard.findByPk(req.params.id);
  if (!standard) return res.status(404).json({ error: 'Standard not found' });
  res.json(standard);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const standard = await db.Standard.create({ name, description });
    res.status(201).json(standard);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'Standard already exists' });
    throw e;
  }
});

router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const standard = await db.Standard.findByPk(req.params.id);
  if (!standard) return res.status(404).json({ error: 'Standard not found' });
  await standard.update({ name, description });
  res.json(standard);
});

router.delete('/:id', async (req, res) => {
  const booksCount = await db.Book.count({ where: { standard_id: req.params.id } });
  if (booksCount > 0) return res.status(400).json({ error: 'Cannot delete standard with associated books' });
  const result = await db.Standard.destroy({ where: { id: req.params.id } });
  if (result === 0) return res.status(404).json({ error: 'Standard not found' });
  res.json({ message: 'Standard deleted' });
});

module.exports = router;
