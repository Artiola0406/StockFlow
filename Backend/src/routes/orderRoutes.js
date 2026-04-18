const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
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
    let query = 'SELECT * FROM orders';
    const params = [];

    if (req.tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(req.tenantId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    let query = 'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'completed\') as completed FROM orders';
    const params = [];

    if (req.tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(req.tenantId);
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/by-status/:status', async (req, res) => {
  try {
    let query = 'SELECT * FROM orders WHERE status = $1';
    const params = [req.params.status];

    if (req.tenantId) {
      query += ' AND tenant_id = $2';
      params.push(req.tenantId);
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let query = 'SELECT * FROM orders WHERE id = $1';
    const params = [req.params.id];

    if (req.tenantId) {
      query += ' AND tenant_id = $2';
      params.push(req.tenantId);
    }

    const result = await pool.query(query, params);
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
    const tenantId = req.tenantId || req.user.tenant_id;

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
    const existing = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Porosia nuk u gjet.'
      });
    }

    const { customer_id, product_id, quantity, total_amount, status } = req.body;
    const result = await pool.query(
      `UPDATE orders SET customer_id=$1, product_id=$2, quantity=$3, total_amount=$4, status=$5
       WHERE id=$6 AND tenant_id=$7 RETURNING *`,
      [customer_id, product_id, quantity, total_amount, status, req.params.id, req.tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
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
