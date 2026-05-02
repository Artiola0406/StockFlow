const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';

    if (!q || String(q).trim().length === 0) {
      return res.json({ results: [] });
    }

    const searchTerm = `%${String(q).toLowerCase()}%`;

    const products = await pool.query(
      `SELECT id, name, 'produkt' AS type, sku AS subtitle
       FROM products
       WHERE tenant_id = $1 AND LOWER(name) LIKE $2
       LIMIT 5`,
      [tenantId, searchTerm]
    );

    const customers = await pool.query(
      `SELECT id, name, 'klient' AS type, email AS subtitle
       FROM customers
       WHERE tenant_id = $1 AND LOWER(name) LIKE $2
       LIMIT 5`,
      [tenantId, searchTerm]
    );

    const suppliers = await pool.query(
      `SELECT id, name, 'furnitor' AS type, contact_email AS subtitle
       FROM suppliers
       WHERE tenant_id = $1 AND LOWER(name) LIKE $2
       LIMIT 5`,
      [tenantId, searchTerm]
    );

    const warehouses = await pool.query(
      `SELECT id, name, 'depo' AS type, location AS subtitle
       FROM warehouses
       WHERE tenant_id = $1 AND LOWER(name) LIKE $2
       LIMIT 5`,
      [tenantId, searchTerm]
    );

    const results = [
      ...products.rows,
      ...customers.rows,
      ...suppliers.rows,
      ...warehouses.rows,
    ];

    res.json({ results });
  } catch (err) {
    console.error('SEARCH ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
