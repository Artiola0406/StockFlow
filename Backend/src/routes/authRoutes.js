require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/register', async (req, res) => {
  const { name, email, password, businessName } = req.body;
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';

  try {
    // Validate all fields
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Emri është i detyrueshëm.' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email është i detyrueshëm.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Fjalëkalimi duhet të ketë së paku 6 karaktere.' });
    }
    if (!businessName?.trim()) {
      return res.status(400).json({ success: false, message: 'Emri i biznesit është i detyrueshëm.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [cleanEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ky email është tashmë i regjistruar.' });
    }

    // Create tenant
    const tenantId = 'tenant-' + Date.now();
    const slug = businessName.trim()
      .toLowerCase()
      .replace(/[ëê]/g, 'e')
      .replace(/[çć]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    await pool.query(
      'INSERT INTO tenants (id, name, slug, owner_email, is_active) VALUES ($1, $2, $3, $4, true)',
      [tenantId, businessName.trim(), slug, cleanEmail]
    );

    // Hash password and create user
    const userId = 'u-' + Date.now();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, user_role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [userId, name.trim(), cleanEmail, passwordHash, 'manager', 'manager', tenantId]
    );

    // Log successful registration
    await pool.query(
      'INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)',
      [cleanEmail, true, ip, 'Regjistrim i suksesshëm']
    ).catch(() => {}); // don't fail if logging fails

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'stockflow-secret-2026';
    const token = jwt.sign(
      { id: userId, name: name.trim(), email: cleanEmail, role: 'manager', user_role: 'manager', tenant_id: tenantId },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: `Biznesi "${businessName.trim()}" u krijua me sukses!`,
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: 'manager',
        user_role: 'manager',
        tenant_id: tenantId
      }
    });

  } catch (err) {
    console.error('❌ Register error full details:', err);
    res.status(500).json({
      success: false,
      message: 'Gabim i serverit. Provoni përsëri.'
    });
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

    const jwtSecret = process.env.JWT_SECRET || 'stockflow-secret-2026';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: user.user_role || 'manager',
        tenant_id: user.tenant_id
      },
      jwtSecret,
      { expiresIn: '7d' },
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
      'SELECT id, name, email, role, user_role, tenant_id FROM users WHERE id = $1',
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Useri nuk u gjet.' });
    }
    
    const user = result.rows[0];
    
    res.json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: user.user_role || 'manager',
        tenant_id: user.tenant_id
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
    if (req.user.user_role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Vetëm super admin mund të shohë login logs.',
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
