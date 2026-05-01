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
  const ProductService = require('../services/ProductService');
  const ProductDbRepository = require('../repositories/ProductDbRepository');
  service = new ProductService(new ProductDbRepository());
  console.log('✅ Products: duke përdorur PostgreSQL');
} else {
  const ProductService = require('../services/ProductService');
  service = new ProductService();
  console.log('⚠️ Products: duke përdorur CSV (pa DATABASE_URL)');
}

router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 ORDER BY created_at DESC',
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
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE quantity <= 5) as low_stock
       FROM products WHERE tenant_id = $1`,
      [tenantId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produkti nuk u gjet.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, sku, price, quantity, category } = req.body;

    if (!name) return res.status(400).json({
      success: false,
      message: 'Emri është i detyrueshëm.'
    });

    const id = Date.now().toString();
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    console.log('Creating product for tenant:', tenantId);

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS total FROM products WHERE tenant_id = $1',
      [tenantId]
    );
    let attempt = (countResult.rows[0].total || 0) + 1;
    let skuToUse = sku || '';
    let skuExists = true;

    if (!skuToUse) {
      while (skuExists) {
        skuToUse = 'SKU-' + String(attempt).padStart(3, '0');
        const check = await pool.query(
          'SELECT id FROM products WHERE sku = $1 AND tenant_id = $2',
          [skuToUse, tenantId]
        );
        if (check.rows.length === 0) skuExists = false;
        else attempt++;
      }
    } else {
      const check = await pool.query(
        'SELECT id FROM products WHERE sku = $1 AND tenant_id = $2',
        [skuToUse, tenantId]
      );
      if (check.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'SKU already exists for this tenant.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO products (id, name, sku, price, quantity, category, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, name, skuToUse, price || 0, quantity || 0, category || 'E pacaktuar', tenantId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PRODUCT CREATE ERROR:', err.message, err.detail, err.code, err.constraint);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.put('/:id', authorize('super_admin', 'manager'), async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id || req.tenantId || 'tenant-default';
    const existing = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produkti nuk u gjet.'
      });
    }

    const { name, sku, price, quantity, category } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, sku=$2, price=$3, quantity=$4, category=$5
       WHERE id=$6 AND tenant_id=$7 RETURNING *`,
      [name, sku, price, quantity, category, req.params.id, tenantId]
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
      'DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produkti nuk u gjet.'
      });
    }
    res.json({ success: true, message: 'Produkti u fshi.' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;