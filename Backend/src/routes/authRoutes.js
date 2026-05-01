require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

function getIpAddress(req) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function createSafeSlug(value) {
  return value
    .toLowerCase()
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function verifyTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: { status: 401, message: 'Nuk jeni të autentifikuar.' } };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: { status: 401, message: 'Sesioni juaj ka skaduar.' } };
    }
    return { error: { status: 401, message: 'Token i pavlefshëm.' } };
  }
}

router.post('/register', async (req, res) => {
  const { name, email, password, businessName } = req.body;
  const ip = getIpAddress(req);

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Emri është i detyrueshëm.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email është i detyrueshëm.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Fjalëkalimi është i detyrueshëm.' });
    }
    if (!businessName || !businessName.trim()) {
      return res.status(400).json({ success: false, message: 'Emri i biznesit është i detyrueshëm.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Fjalëkalimi duhet të ketë së paku 6 karaktere.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ky email është tashmë i regjistruar.' });
    }

    const now = Date.now();
    const tenantId = `tenant-${now}`;
    const tenantSlugBase = createSafeSlug(businessName.trim()) || `biznes-${now}`;
    const tenantSlug = `${tenantSlugBase}-${now}`;

    await pool.query(
      'INSERT INTO tenants (id, name, slug, owner_email, is_active) VALUES ($1, $2, $3, $4, true)',
      [tenantId, businessName.trim(), tenantSlug, cleanEmail]
    );

    const userId = `u-${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, user_role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, 'manager', 'manager', $5, true)`,
      [userId, name.trim(), cleanEmail, hash, tenantId]
    );

    pool
      .query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
        cleanEmail,
        true,
        ip,
        'Regjistrim i suksesshëm'
      ])
      .catch(() => {});

    const token = jwt.sign(
      {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: 'manager',
        user_role: 'manager',
        tenant_id: tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Regjistrimi u krye me sukses.',
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
  } catch (error) {
    console.error('Gabim i papritur në regjistrim:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = getIpAddress(req);

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dhe fjalëkalimi janë të detyrueshëm.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [cleanEmail]);

    if (result.rows.length === 0) {
      pool
        .query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
          cleanEmail,
          false,
          ip,
          'Email i panjohur'
        ])
        .catch(() => {});
      return res.status(401).json({ success: false, message: 'Email ose fjalëkalim i gabuar.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isValid) {
      pool
        .query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
          cleanEmail,
          false,
          ip,
          'Fjalëkalim i gabuar'
        ])
        .catch(() => {});
      return res.status(401).json({ success: false, message: 'Email ose fjalëkalim i gabuar.' });
    }

    pool
      .query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
        cleanEmail,
        true,
        ip,
        'Kyçje e suksesshme'
      ])
      .catch(() => {});

    const userRole = user.user_role || 'manager';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: userRole,
        tenant_id: user.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'U kyçët me sukses!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_role: userRole,
        tenant_id: user.tenant_id
      }
    });
  } catch (error) {
    console.error('Gabim i papritur në login:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const verified = verifyTokenFromHeader(req.headers.authorization);
    if (verified.error) {
      return res.status(verified.error.status).json({ success: false, message: verified.error.message });
    }

    const result = await pool.query(
      'SELECT id, name, email, role, user_role, tenant_id FROM users WHERE id = $1 AND is_active = true',
      [verified.decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Gabim i papritur në /me:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

router.post('/logout', async (_req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'U çkyçët me sukses.' });
  } catch (error) {
    console.error('Gabim i papritur në logout:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const verified = verifyTokenFromHeader(req.headers.authorization);
    if (verified.error) {
      return res.status(verified.error.status).json({ success: false, message: verified.error.message });
    }

    if (verified.decoded.user_role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Nuk keni leje për këtë veprim.' });
    }

    const result = await pool.query('SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 100');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Gabim i papritur në /logs:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Gabim i serverit.' });
  }
});

module.exports = router;
