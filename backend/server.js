require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const { initialize } = require('./database');

const authRoutes = require('./routes/auth');
const standardRoutes = require('./routes/standards');
const bookRoutes = require('./routes/books');
const supplierRoutes = require('./routes/suppliers');
const purchaseRoutes = require('./routes/purchases');
const saleRoutes = require('./routes/sales');
const returnRoutes = require('./routes/returns');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initialize().then(() => {
  app.use('/api/auth', authRoutes);
  app.use('/api/standards', standardRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/returns', returnRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.get('/', (req, res) => res.json({ message: 'Stationery Shop API' }));

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
