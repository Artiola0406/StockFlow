const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const pagesPath = path.join(__dirname, '../../Frontend/src/pages');
app.use(express.static(pagesPath));
app.use('/api/products', productRoutes);

const pages = [
  { route: 'dashboard', file: 'Dashboard.html' },
  { route: 'products', file: 'Products.html' },
  { route: 'warehouses', file: 'Warehouses.html' },
  { route: 'stockmovements', file: 'StockMovements.html' },
  { route: 'suppliers', file: 'Suppliers.html' },
  { route: 'orders', file: 'Orders.html' },
  { route: 'customers', file: 'Customers.html' },
  { route: 'reports', file: 'Reports.html' }
];

pages.forEach(p => {
  app.get(`/${p.route}`, (req, res) => res.sendFile(path.join(pagesPath, p.file)));
  app.get(`/${p.file}`, (req, res) => res.sendFile(path.join(pagesPath, p.file)));
});

app.get('/', (req, res) => res.sendFile(path.join(pagesPath, 'Dashboard.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockFlow running on port ${PORT}`));
