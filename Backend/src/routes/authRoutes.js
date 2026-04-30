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
    console.log("HASH BEFORE SAVE:", passwordHash);

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
  try {
    const { email, password } = req.body;

    console.log("LOGIN INPUT:", email);

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });

    const cleanEmail = email.toLowerCase().trim();

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [cleanEmail]
    );
    console.log("DB RESULT:", result.rows);

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    console.log("HASH FROM DB:", user.password_hash);

    if (!user.password_hash) {
      console.error("Missing password_hash in DB for user:", user.email);
      return res.status(500).json({ success: false, message: 'User data corrupted' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error("LOGIN CRASH:", err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
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
