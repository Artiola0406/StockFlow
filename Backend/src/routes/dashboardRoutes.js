const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id || 'tenant-default';
    const [
      products,
      orders,
      warehouses,
      suppliers,
      customers,
      lowStockProducts,
      totalValue,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total_products FROM products WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS total_orders FROM orders WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS total_warehouses FROM warehouses WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS total_suppliers FROM suppliers WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS total_customers FROM customers WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*)::int AS low_stock_products FROM products WHERE tenant_id = $1 AND quantity < 5', [tenantId]),
      pool.query('SELECT COALESCE(SUM(price * quantity), 0)::numeric AS total_value FROM products WHERE tenant_id = $1', [tenantId]),
    ]);
    res.json({
      success: true,
      data: {
        totalProducts: products.rows[0].total_products,
        totalOrders: orders.rows[0].total_orders,
        totalWarehouses: warehouses.rows[0].total_warehouses,
        totalCustomers: customers.rows[0].total_customers,
        totalSuppliers: suppliers.rows[0].total_suppliers,
        lowStockProducts: lowStockProducts.rows[0].low_stock_products,
        totalValue: Number(totalValue.rows[0].total_value || 0),
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
