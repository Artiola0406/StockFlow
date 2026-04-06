require('dotenv').config();
const { Pool } = require('pg');

const conn = process.env.DATABASE_URL || '';
const needsSsl =
  process.env.NODE_ENV === 'production' ||
  conn.includes('render.com') ||
  conn.includes('sslmode=require');

const pool = new Pool({
  connectionString: conn,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ U lidh me PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Gabim në PostgreSQL:', err.message);
});

module.exports = pool;