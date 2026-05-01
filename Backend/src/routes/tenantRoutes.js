const express = require('express');
const pool = require('../config/database');
const { authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users', authorize('super_admin'), async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
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
