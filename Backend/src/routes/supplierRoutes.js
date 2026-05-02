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
      `SELECT id, name, contact_email, phone, is_active, created_at
       FROM suppliers WHERE tenant_id = $1`,
      [tid]
    );
    res.json({ success: true, suppliers: result.rows });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM suppliers WHERE tenant_id = $1',
      [tid]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching supplier stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, contact_email, phone, is_active, created_at
       FROM suppliers WHERE is_active = true AND tenant_id = $1
       ORDER BY created_at DESC`,
      [tid]
    );
    res.json({ success: true, suppliers: result.rows });
  } catch (err) {
    console.error('Error fetching active suppliers:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, contact_email, phone, is_active, created_at, tenant_id
       FROM suppliers WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Furnitori nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching supplier by id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, contact_email, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Emri i furnitorit është i detyrueshëm.',
      });
    }

    const id = `sup-${Date.now()}`;
    const tid = tenantId(req);

    const result = await pool.query(
      `INSERT INTO suppliers (id, name, contact_email, phone, is_active, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, true, $5, NOW())
       RETURNING id, name, contact_email, phone, is_active, created_at`,
      [id, name, contact_email || null, phone || null, tid]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', authorize('super_admin', 'manager'), async (req, res) => {
  try {
    const tid = tenantId(req);
    const existing = await pool.query(
      'SELECT id FROM suppliers WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tid]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Furnitori nuk u gjet.',
      });
    }

    const { name, contact_email, phone, is_active } = req.body;
    const result = await pool.query(
      `UPDATE suppliers SET name=$1, contact_email=$2, phone=$3, is_active=$4
       WHERE id=$5 AND tenant_id=$6
       RETURNING id, name, contact_email, phone, is_active, created_at`,
      [name, contact_email, phone, is_active, req.params.id, tid]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      'DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Furnitori nuk u gjet.',
      });
    }
    res.json({ success: true, message: 'Furnitori u fshi.' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
