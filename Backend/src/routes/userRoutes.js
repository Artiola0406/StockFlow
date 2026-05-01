const express = require('express');
const pool = require('../config/database');

const PLATFORM_ADMIN_TENANT_ID = 'tenant-artiola';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    if (
      req.user.role !== 'super_admin' ||
      String(req.user.tenant_id) !== PLATFORM_ADMIN_TENANT_ID
    ) {
      return res.status(403).json({ error: 'Akses i ndaluar' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.user_role, u.tenant_id, u.is_active, u.created_at,
              t.name AS business_name
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       ORDER BY u.created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error('ALL USERS ERROR:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
