const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

// Apply auth + tenant filter to ALL routes
router.use(authenticate, tenantFilter);

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const OrderService = require('../services/OrderService');
  const OrderDbRepository = require('../repositories/OrderDbRepository');
  service = new OrderService(new OrderDbRepository());
  console.log('Order routes: PostgreSQL');
} else {
  const OrderService = require('../services/OrderService');
  service = new OrderService();
  console.log('Order routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      `SELECT o.id, o.customer_id, o.product_id, o.quantity, o.total_amount, o.status, o.tenant_id, o.created_at,
              c.name AS customer_name,
              p.name AS product_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id AND c.tenant_id = o.tenant_id
       LEFT JOIN products p ON p.id = o.product_id AND p.tenant_id = o.tenant_id
       WHERE o.tenant_id = $1
       ORDER BY o.created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM orders WHERE tenant_id = $1`,
      [tenantId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/form-options', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const [customers, products] = await Promise.all([
      pool.query(
        'SELECT id, name FROM customers WHERE tenant_id = $1 ORDER BY name ASC',
        [tenantId]
      ),
      pool.query(
        'SELECT id, name, price FROM products WHERE tenant_id = $1 ORDER BY name ASC',
        [tenantId]
      ),
    ]);
    res.json({
      success: true,
      data: { customers: customers.rows, products: products.rows },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/by-status/:status', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      `SELECT o.id, o.customer_id, o.product_id, o.quantity, o.total_amount, o.status, o.tenant_id, o.created_at,
              c.name AS customer_name,
              p.name AS product_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id AND c.tenant_id = o.tenant_id
       LEFT JOIN products p ON p.id = o.product_id AND p.tenant_id = o.tenant_id
       WHERE o.status = $1 AND o.tenant_id = $2
       ORDER BY o.created_at DESC`,
      [req.params.status, tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      `SELECT o.id, o.customer_id, o.product_id, o.quantity, o.total_amount, o.status, o.tenant_id, o.created_at,
              c.name AS customer_name,
              p.name AS product_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id AND c.tenant_id = o.tenant_id
       LEFT JOIN products p ON p.id = o.product_id AND p.tenant_id = o.tenant_id
       WHERE o.id = $1 AND o.tenant_id = $2`,
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Porosia nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_id, product_id, quantity, total_amount, status } = req.body;

    if (!customer_id || !product_id) return res.status(400).json({
      success: false,
      message: 'Customer ID dhe Product ID janë të detyrueshëm.'
    });

    const id = Date.now().toString();
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';

    const custOk = await pool.query(
      'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
      [customer_id, tenantId]
    );
    const prodOk = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND tenant_id = $2',
      [product_id, tenantId]
    );
    if (custOk.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Klienti nuk u gjet për këtë tenant.' });
    }
    if (prodOk.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Produkti nuk u gjet për këtë tenant.' });
    }

    const result = await pool.query(
      `INSERT INTO orders (id, customer_id, product_id, quantity, total_amount, status, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, customer_id, product_id, quantity || 1, total_amount || 0, status || 'pending', tenantId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const existing = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Porosia nuk u gjet.'
      });
    }

    const { customer_id, product_id, quantity, total_amount, status } = req.body;

    const custOk = await pool.query(
      'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
      [customer_id, tenantId]
    );
    const prodOk = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND tenant_id = $2',
      [product_id, tenantId]
    );
    if (custOk.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Klienti nuk u gjet për këtë tenant.' });
    }
    if (prodOk.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Produkti nuk u gjet për këtë tenant.' });
    }

    const result = await pool.query(
      `UPDATE orders SET customer_id=$1, product_id=$2, quantity=$3, total_amount=$4, status=$5
       WHERE id=$6 AND tenant_id=$7 RETURNING *`,
      [customer_id, product_id, quantity, total_amount, status, req.params.id, tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Porosia nuk u gjet.'
      });
    }
    res.json({ success: true, message: 'Porosia u fshi.' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
