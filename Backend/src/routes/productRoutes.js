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
    let query = 'SELECT * FROM products';
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
    let query = 'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE quantity <= 5) as low_stock FROM products';
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
    let query = 'SELECT * FROM products WHERE id = $1';
    const params = [req.params.id];

    if (req.tenantId) {
      query += ' AND tenant_id = $2';
      params.push(req.tenantId);
    }

    const result = await pool.query(query, params);
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
    const tenantId = req.tenantId || req.user.tenant_id;

    const result = await pool.query(
      `INSERT INTO products (id, name, sku, price, quantity, category, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, name, sku, price || 0, quantity || 0, category || 'E pacaktuar', tenantId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.tenantId]
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
      [name, sku, price, quantity, category, req.params.id, req.tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.tenantId]
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