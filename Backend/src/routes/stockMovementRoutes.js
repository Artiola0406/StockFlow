const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

const tenantId = (req) => req.user.tenant_id || 'tenant-default';

router.get('/', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, product_name, warehouse_name, type, quantity, reason, created_at
       FROM stock_movements WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tid]
    );
    res.json({ success: true, movements: result.rows });
  } catch (err) {
    console.error('Error fetching stock movements:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT COUNT(*)::bigint AS total,
              COUNT(*) FILTER (WHERE UPPER(TRIM(type::text)) = 'IN')::bigint AS inbound,
              COUNT(*) FILTER (WHERE UPPER(TRIM(type::text)) = 'OUT')::bigint AS outbound
       FROM stock_movements WHERE tenant_id = $1`,
      [tid]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching stock movement stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, product_name, warehouse_name, type, quantity, reason, created_at
       FROM stock_movements WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lëvizja nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching stock movement by id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, warehouse_name, type, quantity, reason } = req.body;

    if (!product_name || !warehouse_name || !type) {
      return res.status(400).json({
        success: false,
        message: 'product_name, warehouse_name dhe type janë të detyrueshëm.',
      });
    }

    const id = `mv-${Date.now()}`;
    const tid = tenantId(req);
    const qty = quantity === undefined || quantity === null ? 0 : Number(quantity);

    const result = await pool.query(
      `INSERT INTO stock_movements (id, product_name, warehouse_name, type, quantity, reason, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, product_name, warehouse_name, type, quantity, reason, created_at`,
      [id, product_name, warehouse_name, type, Number.isNaN(qty) ? 0 : qty, reason || null, tid]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating stock movement:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
