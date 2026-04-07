require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedUsers() {
  const users = [
    {
      id: 'u1',
      name: 'Administrator',
      email: 'admin@stockflow.com',
      password: 'Admin123!',
      role: 'administrator',
    },
    {
      id: 'u2',
      name: 'Menaxher Kryesor',
      email: 'menaxher@stockflow.com',
      password: 'Menaxher123!',
      role: 'menaxher',
    },
    {
      id: 'u3',
      name: 'Staf Depoje',
      email: 'staf@stockflow.com',
      password: 'Staf123!',
      role: 'staf',
    },
  ];

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'staf',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        success BOOLEAN NOT NULL,
        ip_address VARCHAR(100),
        message VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 12);
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.name, user.email, hash, user.role],
      );
      console.log(`✅ U krijua useri: ${user.email} (${user.role})`);
    }

    console.log('✅ Seed i userëve u krye!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gabim:', err.message);
    process.exit(1);
  }
}

seedUsers();
