const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, ROLE_PERMISSIONS } = require('../config/auth');
const { authenticate } = require('../middlewares/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, businessName } = req.body;

  try {
    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Të gjitha fushat janë të detyrueshme.'
      });
    }

    // Check if email exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ky email është tashmë i regjistruar.'
      });
    }

    // Create tenant
    const tenantId = 'tenant-' + Date.now();
    const slug = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') + '-' + Date.now();

    await pool.query(
      `INSERT INTO tenants (id, name, slug, owner_email)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, businessName, slug, email.toLowerCase()]
    );

    // Create user as manager of new tenant
    const userId = 'u-' + Date.now();
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, user_role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, 'menaxher', 'manager', $5, true)`,
      [userId, name, email.toLowerCase(), passwordHash, tenantId]
    );

    // Generate JWT
    const token = jwt.sign(
      { 
        id: userId, 
        name, 
        email: email.toLowerCase(), 
        role: 'menaxher', 
        user_role: 'manager', 
        tenant_id: tenantId 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: `Biznesi "${businessName}" u krijua me sukses!`,
      token,
      user: { 
        id: userId, 
        name, 
        email: email.toLowerCase(), 
        role: 'menaxher', 
        user_role: 'manager', 
        tenant_id: tenantId 
      }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dhe fjalëkalimi janë të detyrueshëm.',
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()],
    );

    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)',
        [email, false, ip, 'Useri nuk u gjet'],
      );
      return res.status(401).json({
        success: false,
        message: 'Email ose fjalëkalim i gabuar.',
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      await pool.query(
        'INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)',
        [email, false, ip, 'Fjalëkalim i gabuar'],
      );
      return res.status(401).json({
        success: false,
        message: 'Email ose fjalëkalim i gabuar.',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: user.user_role || 'manager',
        tenant_id: user.tenant_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    await pool.query(
      'INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)',
      [email, true, ip, 'Kyçje e suksesshme'],
    );

    res.json({
      success: true,
      message: 'U kyçët me sukses!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: user.user_role || 'manager',
        tenant_id: user.tenant_id
      },
    });
  } catch (err) {
    console.error('❌ Gabim në login:', err.message);
    res.status(500).json({
      success: false,
      message: 'Gabim i serverit. Provoni përsëri.',
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Useri nuk u gjet.' });
    }
    
    const user = result.rows[0];
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    res.json({ 
      success: true, 
      data: {
        ...user,
        permissions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  res.json({ success: true, message: 'U çkyçët me sukses.' });
});

router.get('/logs', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Vetëm administratori mund të shohë login logs.',
      });
    }
    const result = await pool.query(
      'SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100',
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
