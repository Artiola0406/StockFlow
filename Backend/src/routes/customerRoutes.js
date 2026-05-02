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
      `SELECT id, name, email, address, phone, created_at
       FROM customers WHERE tenant_id = $1`,
      [tid]
    );
    res.json({ success: true, customers: result.rows });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM customers WHERE tenant_id = $1',
      [tid]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching customer stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      `SELECT id, name, email, address, phone, created_at, tenant_id
       FROM customers WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Klienti nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching customer by id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Emri i klientit është i detyrueshëm.',
      });
    }

    const id = `cust-${Date.now()}`;
    const tid = tenantId(req);

    const result = await pool.query(
      `INSERT INTO customers (id, name, email, address, phone, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, email, address, phone, created_at`,
      [id, name, email || null, address || null, phone || null, tid]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', authorize('super_admin', 'manager'), async (req, res) => {
  try {
    const tid = tenantId(req);
    const existing = await pool.query(
      'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tid]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Klienti nuk u gjet.',
      });
    }

    const { name, email, address, phone } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name=$1, email=$2, address=$3, phone=$4
       WHERE id=$5 AND tenant_id=$6
       RETURNING id, name, email, address, phone, created_at`,
      [name, email, address, phone, req.params.id, tid]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const tid = tenantId(req);
    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Klienti nuk u gjet.',
      });
    }
    res.json({ success: true, message: 'Klienti u fshi.' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
