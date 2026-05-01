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
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const { authenticate, requirePermission } = require('./middlewares/authMiddleware');

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', ...requirePermission('products'), productRoutes);
app.use('/api/warehouses', ...requirePermission('warehouses'), warehouseRoutes);
app.use('/api/suppliers', ...requirePermission('suppliers'), supplierRoutes);
app.use('/api/customers', ...requirePermission('customers'), customerRoutes);
app.use('/api/orders', ...requirePermission('orders'), orderRoutes);
app.use('/api/stockmovements', ...requirePermission('stockmovements'), stockMovementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/tenants', authenticate, tenantRoutes);

const webDist = path.join(__dirname, '../../web/dist');

if (fs.existsSync(path.join(webDist, 'index.html'))) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res
      .status(503)
      .type('text/plain')
      .send('Web UI not built. Run: cd web && npm run build');
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockFlow running on port ${PORT}`));
