require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middlewares/authMiddleware');
const { JWT_EXPIRES_IN, SALT_ROUNDS } = require('../config/auth');

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

router.post('/register', async (req, res) => {
  const { name, email, password, businessName } = req.body;
  console.log('REGISTER ATTEMPT:', { name, email });

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedName = String(name).trim();

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = `u-${Date.now()}`;
    const generatedTenantId = 'tenant-' + Date.now();
    const tenantResult = await pool.query('SELECT id FROM tenants LIMIT 1');
    let resolvedTenantId;

    if (tenantResult.rows.length > 0) {
      resolvedTenantId = tenantResult.rows[0].id;
    } else {
      const tenantColsQuery = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name='tenants'"
      );
      const tenantColumns = tenantColsQuery.rows.map((r) => r.column_name);
      const valuesByColumn = {
        id: generatedTenantId,
        name: businessName && String(businessName).trim() ? String(businessName).trim() : 'Default',
        slug: 'default',
        owner_email: normalizedEmail,
        is_active: true,
        plan: 'free',
      };

      const insertCols = tenantColumns.filter((col) => Object.prototype.hasOwnProperty.call(valuesByColumn, col));
      if (insertCols.length === 0) {
        throw new Error('No compatible columns found for tenants insert');
      }

      const placeholders = insertCols.map((_, idx) => `$${idx + 1}`).join(', ');
      const insertValues = insertCols.map((col) => valuesByColumn[col]);

      await pool.query(
        `INSERT INTO tenants (${insertCols.join(', ')}) VALUES (${placeholders})`
        ,
        insertValues
      );
      resolvedTenantId = generatedTenantId;
    }

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, 'staff', $5, true)`,
      [userId, normalizedName, normalizedEmail, passwordHash, resolvedTenantId]
    );

    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('REGISTER ERROR full:', JSON.stringify(err));
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

router.get('/debug-schema', async (req, res) => {
  try {
    const tenants = await pool.query('SELECT * FROM tenants LIMIT 5');
    const users = await pool.query('SELECT id, email, role, tenant_id, is_active FROM users LIMIT 5');
    const tenantsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenants'
    `);
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);
    res.json({
      tenants_rows: tenants.rows,
      tenants_columns: tenantsColumns.rows,
      users_rows: users.rows,
      users_columns: usersColumns.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    try {
      await pool.query('INSERT INTO login_logs (email, success, ip_address, message) VALUES ($1, $2, $3, $4)', [
        user.email,
        true,
        req.ip || req.connection?.remoteAddress || 'unknown',
        'Login successful',
      ]);
    } catch (logError) {
      console.error('login_logs insert failed:', logError);
    }

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, tenant_id FROM users WHERE id = $1 AND is_active = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      permissions: [],
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (_req, res) => {
  return res.status(200).json({ message: 'Logged out' });
});

module.exports = router;
