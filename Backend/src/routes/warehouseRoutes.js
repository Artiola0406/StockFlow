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
  const WarehouseService = require('../services/WarehouseService');
  const WarehouseDbRepository = require('../repositories/WarehouseDbRepository');
  service = new WarehouseService(new WarehouseDbRepository());
  console.log('✅ Warehouse routes: PostgreSQL');
} else {
  const WarehouseService = require('../services/WarehouseService');
  service = new WarehouseService();
  console.log('⚠️ Warehouse routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM warehouses WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    let query = 'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM warehouses';
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

router.get('/active', async (req, res) => {
  try {
    let query = 'SELECT * FROM warehouses WHERE is_active = true';
    const params = [];

    if (req.tenantId) {
      query += ' AND tenant_id = $1';
      params.push(req.tenantId);
    }

    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Depoja nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, location, is_active } = req.body;

    if (!name) return res.status(400).json({
      success: false,
      message: 'Emri i deposë është i detyrueshëm.'
    });

    const id = Date.now().toString();
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';

    const result = await pool.query(
      `INSERT INTO warehouses (id, name, location, is_active, tenant_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, location || 'E pacaktuar', is_active !== false, tenantId]
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
      'SELECT * FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoja nuk u gjet.'
      });
    }

    const { name, location, is_active } = req.body;
    const result = await pool.query(
      `UPDATE warehouses SET name=$1, location=$2, is_active=$3
       WHERE id=$4 AND tenant_id=$5 RETURNING *`,
      [name, location, is_active, req.params.id, tenantId]
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
      'DELETE FROM warehouses WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoja nuk u gjet.'
      });
    }
    res.json({ success: true, message: 'Depoja u fshi.' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
