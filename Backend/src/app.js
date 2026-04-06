require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const productRoutes = require('./routes/productRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stockmovements', stockMovementRoutes);

const pagesPath = path.join(__dirname, '../../Frontend/src/pages');
const webDist = path.join(__dirname, '../../web/dist');

if (fs.existsSync(path.join(webDist, 'index.html'))) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  app.use(express.static(pagesPath));

  const pages = [
    { route: 'dashboard', file: 'Dashboard.html' },
    { route: 'products', file: 'Products.html' },
    { route: 'warehouses', file: 'Warehouses.html' },
    { route: 'stockmovements', file: 'StockMovements.html' },
    { route: 'suppliers', file: 'Suppliers.html' },
    { route: 'orders', file: 'Orders.html' },
    { route: 'customers', file: 'Customers.html' },
    { route: 'reports', file: 'Reports.html' },
  ];

  pages.forEach((p) => {
    app.get(`/${p.route}`, (req, res) => res.sendFile(path.join(pagesPath, p.file)));
    app.get(`/${p.file}`, (req, res) => res.sendFile(path.join(pagesPath, p.file)));
  });

  app.get('/', (req, res) => res.sendFile(path.join(pagesPath, 'Dashboard.html')));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockFlow running on port ${PORT}`));
