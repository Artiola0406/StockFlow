const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { tenantFilter } = require('../middlewares/tenantMiddleware');
const pool = require('../config/database');

router.use(authenticate, tenantFilter);

router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'completed' OR status = 'E përfunduar')::int AS completed,
         COUNT(*) FILTER (WHERE status = 'pending' OR status = 'Në pritje')::int AS pending
       FROM orders
       WHERE tenant_id = $1`,
      [tenantId]
    );
    res.json({ stats: result.rows[0] });
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';
    const result = await pool.query(
      `SELECT id, customer_name, product_name, quantity, total_amount, status, created_at
       FROM orders
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, product_name, quantity, total_amount, status } = req.body;
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';

    if (!customer_name || !product_name) {
      return res.status(400).json({ error: 'customer_name dhe product_name janë të detyrueshëm.' });
    }

    const productNameTrim = String(product_name).trim();
    const qtyOrdered = parseInt(quantity, 10);
    const orderQty = Number.isNaN(qtyOrdered) || qtyOrdered < 1 ? 1 : qtyOrdered;

    const stockCheck = await pool.query(
      'SELECT quantity FROM products WHERE name = $1 AND tenant_id = $2',
      [productNameTrim, tenantId]
    );

    if (stockCheck.rows.length > 0) {
      const available = Number(stockCheck.rows[0].quantity);
      if (available < orderQty) {
        return res.status(400).json({
          error: `Stoku i pamjaftueshëm. Disponibël: ${available} njësi`,
        });
      }
    }

    const id = `ord-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO orders (id, customer_name, product_name, quantity, total_amount, status, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        id,
        String(customer_name).trim(),
        productNameTrim,
        orderQty,
        total_amount != null ? Number(total_amount) : 0,
        status != null ? String(status) : 'pending',
        tenantId,
      ]
    );

    try {
      const productResult = await pool.query(
        'SELECT id, quantity FROM products WHERE name = $1 AND tenant_id = $2',
        [productNameTrim, tenantId]
      );

      if (productResult.rows.length > 0) {
        const product = productResult.rows[0];
        const newQuantity = Math.max(0, Number(product.quantity) - orderQty);
        await pool.query('UPDATE products SET quantity = $1 WHERE id = $2 AND tenant_id = $3', [
          newQuantity,
          product.id,
          tenantId,
        ]);
      }
    } catch (qErr) {
      console.error('Failed to update product quantity after order:', qErr.message);
    }

    res.status(201).json({ order: result.rows[0] });
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';
    const { customer_name, product_name, quantity, total_amount, status } = req.body;
    const result = await pool.query(
      `UPDATE orders
       SET customer_name = $1, product_name = $2, quantity = $3, total_amount = $4, status = $5
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [
        customer_name,
        product_name,
        quantity != null ? Number(quantity) : 0,
        total_amount != null ? Number(total_amount) : 0,
        status,
        req.params.id,
        tenantId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Porosia nuk u gjet.' });
    }
    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || 'tenant-default';
    const result = await pool.query('DELETE FROM orders WHERE id = $1 AND tenant_id = $2 RETURNING id', [
      req.params.id,
      tenantId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Porosia nuk u gjet.' });
    }
    res.json({ message: 'U fshi' });
  } catch (err) {
    console.error('ORDER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
