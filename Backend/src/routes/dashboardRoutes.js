// TODO: Frontend calls /api/products directly - migrate to this endpoint
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const [
      products,
      orders,
      warehouses,
      suppliers,
      customers,
      movements,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM products WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS c FROM orders WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS c FROM warehouses WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS c FROM suppliers WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS c FROM customers WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS c FROM stock_movements WHERE tenant_id = $1', [tenantId]),
    ]);
    res.json({
      success: true,
      data: {
        products: products.rows[0].c,
        orders: orders.rows[0].c,
        warehouses: warehouses.rows[0].c,
        suppliers: suppliers.rows[0].c,
        customers: customers.rows[0].c,
        stockMovements: movements.rows[0].c,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
