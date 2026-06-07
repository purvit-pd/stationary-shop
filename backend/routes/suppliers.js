const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const suppliers = await db.Supplier.findAll({ order: [['name']] });
  res.json(suppliers);
});

router.get('/:id', async (req, res) => {
  const supplier = await db.Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  res.json(supplier);
});

router.post('/', async (req, res) => {
  const { name, contact_person, phone, email, address, gstin } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const supplier = await db.Supplier.create({ name, contact_person, phone, email, address, gstin });
  res.status(201).json(supplier);
});

router.put('/:id', async (req, res) => {
  const supplier = await db.Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  const { name, contact_person, phone, email, address, gstin } = req.body;
  await supplier.update({ name, contact_person, phone, email, address, gstin });
  res.json(supplier);
});

router.delete('/:id', async (req, res) => {
  const purchasesCount = await db.Purchase.count({ where: { supplier_id: req.params.id } });
  if (purchasesCount > 0) return res.status(400).json({ error: 'Cannot delete supplier with associated purchases' });
  const result = await db.Supplier.destroy({ where: { id: req.params.id } });
  if (result === 0) return res.status(404).json({ error: 'Supplier not found' });
  res.json({ message: 'Supplier deleted' });
});

module.exports = router;
