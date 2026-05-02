const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

const tenantId = (req) => req.user.tenant_id || 'tenant-default';

router.get('/', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, location, capacity, is_active, created_at
       FROM warehouses WHERE tenant_id = $1`,
      [tid]
    );
    res.json({ success: true, warehouses: result.rows });
  } catch (err) {
    console.error('Error fetching warehouses:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active
       FROM warehouses WHERE tenant_id = $1`,
      [tid]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching warehouse stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, location, capacity, is_active, created_at
       FROM warehouses WHERE is_active = true AND tenant_id = $1
       ORDER BY name`,
      [tid]
    );
    res.json({ success: true, warehouses: result.rows });
  } catch (err) {
    console.error('Error fetching active warehouses:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, location, capacity, is_active, created_at, tenant_id
       FROM warehouses WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Depoja nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching warehouse by id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authorize('super_admin', 'manager'), async (req, res) => {
  try {
    const { name, location, capacity } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Emri i deposë është i detyrueshëm.',
      });
    }

    const id = `wh-${Date.now()}`;
    const tid = tenantId(req);
    const cap = capacity === undefined || capacity === '' ? 0 : parseInt(capacity, 10);
    const capSafe = Number.isNaN(cap) || cap < 0 ? 0 : cap;

    const result = await pool.query(
      `INSERT INTO warehouses (id, name, location, capacity, is_active, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, true, $5, NOW())
       RETURNING id, name, location, capacity, is_active, created_at`,
      [id, name, location || 'E pacaktuar', capSafe, tid]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating warehouse:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tid = tenantId(req);
    const existing = await pool.query(
      'SELECT id FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tid]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoja nuk u gjet.',
      });
    }

    const { name, location, capacity, is_active } = req.body;
    const cap = capacity === undefined || capacity === '' ? 0 : parseInt(capacity, 10);
    const capSafe = Number.isNaN(cap) || cap < 0 ? 0 : cap;

    const result = await pool.query(
      `UPDATE warehouses SET name=$1, location=$2, capacity=$3, is_active=$4
       WHERE id=$5 AND tenant_id=$6
       RETURNING id, name, location, capacity, is_active, created_at`,
      [name, location, capSafe, is_active !== false, req.params.id, tid]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating warehouse:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      'DELETE FROM warehouses WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Depoja nuk u gjet.',
      });
    }
    res.json({ success: true, message: 'Depoja u fshi.' });
  } catch (err) {
    console.error('Error deleting warehouse:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
