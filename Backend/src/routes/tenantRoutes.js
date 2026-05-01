const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const rawId = req.user && req.user.tenant_id;
    const tenantId = rawId != null && rawId !== '' ? String(rawId).trim() : null;

    if (!tenantId) {
      return res.status(400).json({ error: 'No tenant context' });
    }

    const result = await pool.query(
      `SELECT id, name, email, role, user_role, is_active, created_at
       FROM users
       WHERE tenant_id = $1
       ORDER BY created_at ASC`,
      [tenantId]
    );

    const tenantRow = await pool.query('SELECT name FROM tenants WHERE id = $1', [tenantId]);

    res.json({
      users: result.rows,
      tenantName: tenantRow.rows[0]?.name ?? null,
    });
  } catch (err) {
    console.error('TENANT USERS ERROR:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
