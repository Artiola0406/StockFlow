// TODO: Frontend currently uses localStorage - migrate to this API
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
  const SupplierService = require('../services/SupplierService');
  const SupplierDbRepository = require('../repositories/SupplierDbRepository');
  service = new SupplierService(new SupplierDbRepository());
} else {
  const SupplierService = require('../services/SupplierService');
  service = new SupplierService();
}

router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM suppliers WHERE tenant_id = $1 ORDER BY created_at DESC',
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
      'SELECT COUNT(*) as total FROM suppliers WHERE tenant_id = $1',
      [tenantId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM suppliers WHERE active = true AND tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Furnitori nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) return res.status(400).json({
      success: false,
      message: 'Emri i furnitorit është i detyrueshëm.'
    });

    const id = Date.now().toString();
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';

    const result = await pool.query(
      `INSERT INTO suppliers (id, name, email, phone, address, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, name, email || null, phone || null, address || null, tenantId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', authorize('super_admin', 'manager'), async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const existing = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Furnitori nuk u gjet.'
      });
    }

    const { name, email, phone, address } = req.body;
    const result = await pool.query(
      `UPDATE suppliers SET name=$1, email=$2, phone=$3, address=$4
       WHERE id=$5 AND tenant_id=$6 RETURNING *`,
      [name, email, phone, address, req.params.id, tenantId]
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
      'DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Furnitori nuk u gjet.'
      });
    }
    res.json({ success: true, message: 'Furnitori u fshi.' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
