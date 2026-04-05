const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

pool.on('connect', () => {
  console.log('✅ U lidh me PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Gabim në PostgreSQL:', err.message);
});

module.exports = pool;