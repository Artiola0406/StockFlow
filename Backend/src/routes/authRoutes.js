require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_EXPIRES_IN } = require('../config/auth');

const router = express.Router();

function getIpAddress(req) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

async function writeLoginLog(email, success, ip, message) {
  try {
    await pool.query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
      email,
      success,
      ip,
      message
    ]);
  } catch (error) {
    console.error('Failed to write login log:', error);
  }
}

function verifyTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: { status: 401, message: 'Nuk jeni të autentifikuar.' } };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: { status: 401, message: 'Sesioni juaj ka skaduar.' } };
    }
    return { error: { status: 401, message: 'Token i pavlefshëm.' } };
  }
}

router.post('/register', async (req, res) => {
  const { name, email, password, role, user_role, tenant_id } = req.body;
  const ip = getIpAddress(req);

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const userId = `u-${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);
    const effectiveRole = user_role || role || 'staff';
    const effectiveTenantId = tenant_id ?? 1;

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, user_role, tenant_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $5, $6, true)`,
      [userId, name.trim(), cleanEmail, hash, effectiveRole, effectiveTenantId]
    );

    await writeLoginLog(cleanEmail, true, ip, 'Regjistrim i suksesshëm');

    const token = jwt.sign(
      {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: effectiveRole,
        user_role: effectiveRole,
        tenant_id: effectiveTenantId
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: effectiveRole,
        user_role: effectiveRole,
        tenant_id: effectiveTenantId
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = getIpAddress(req);

  try {
    if (!email || !password) {
      return res.status(401).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [cleanEmail]);

    if (result.rows.length === 0) {
      await writeLoginLog(cleanEmail, false, ip, 'Kyçje e dështuar');
      const inactiveResult = await pool.query('SELECT id FROM users WHERE email = $1 AND is_active = false', [cleanEmail]);
      if (inactiveResult.rows.length > 0) {
        return res.status(401).json({ error: 'Account is inactive' });
      }
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isValid) {
      await writeLoginLog(cleanEmail, false, ip, 'Fjalëkalim i gabuar');
      return res.status(401).json({ error: 'Wrong password' });
    }

    await writeLoginLog(cleanEmail, true, ip, 'Kyçje e suksesshme');

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
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
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
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
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
