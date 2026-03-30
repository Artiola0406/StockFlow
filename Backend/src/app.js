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

const pages = ['dashboard', 'products', 'warehouses', 'stockmovements', 'suppliers', 'orders', 'customers', 'reports'];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(pagesPath, `${page}.html`));
  });
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(pagesPath, `${page}.html`));
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(pagesPath, 'dashboard.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockFlow running on port ${PORT}`));
