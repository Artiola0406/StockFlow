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
  const StockMovementService = require('../services/StockMovementService');
  const StockMovementDbRepository = require('../repositories/StockMovementDbRepository');
  service = new StockMovementService(new StockMovementDbRepository());
  console.log('Stock movement routes: PostgreSQL');
} else {
  const StockMovementService = require('../services/StockMovementService');
  service = new StockMovementService();
  console.log('Stock movement routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM stock_movements WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    let query = 'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE movement_type = \'in\') as inbound, COUNT(*) FILTER (WHERE movement_type = \'out\') as outbound FROM stock_movements';
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

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM stock_movements WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lëvizja nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity, movement_type, reference } = req.body;

    if (!product_id || !warehouse_id || !movement_type) return res.status(400).json({
      success: false,
      message: 'Product ID, Warehouse ID, dhe Movement Type janë të detyrueshëm.'
    });

    const id = Date.now().toString();
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';

    const result = await pool.query(
      `INSERT INTO stock_movements (id, product_id, warehouse_id, quantity, movement_type, reference, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, product_id, warehouse_id, quantity || 0, movement_type, reference || null, tenantId]
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
      'SELECT * FROM stock_movements WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lëvizja nuk u gjet.'
      });
    }

    const { product_id, warehouse_id, quantity, movement_type, reference } = req.body;
    const result = await pool.query(
      `UPDATE stock_movements SET product_id=$1, warehouse_id=$2, quantity=$3, movement_type=$4, reference=$5
       WHERE id=$6 AND tenant_id=$7 RETURNING *`,
      [product_id, warehouse_id, quantity, movement_type, reference, req.params.id, tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'DELETE FROM stock_movements WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lëvizja nuk u gjet.'
      });
    }
    res.json({ success: true, message: 'Lëvizja u fshi.' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
