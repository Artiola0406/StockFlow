const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');
const { authenticate } = require('../middlewares/authMiddleware');

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
    res.json({ success: true, data: result.rows[0] });
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
