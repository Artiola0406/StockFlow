require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function fixPasswords() {
  console.log('Fixing all demo user passwords...');

  const users = [
    { email: 'admin@stockflow.com', password: 'Admin123!', name: 'Administrator', role: 'administrator', user_role: 'super_admin' },
    { email: 'menaxher@stockflow.com', password: 'Menaxher123!', name: 'Menaxher Demo', role: 'manager', user_role: 'manager' },
    { email: 'staf@stockflow.com', password: 'Staf123!', name: 'Staf Demo', role: 'staff', user_role: 'staff' }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, user_role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 'tenant-demo', true)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         user_role = EXCLUDED.user_role,
         tenant_id = 'tenant-demo',
         is_active = true
       RETURNING id, email, role, user_role`,
      [`u-${u.role}-fixed`, u.name, u.email, hash, u.role, u.user_role]
    );
    console.log(`Fixed: ${u.email} -> role: ${result.rows[0]?.user_role}`);
  }

  for (const u of users) {
    const row = await pool.query('SELECT password_hash FROM users WHERE email = $1', [u.email]);
    if (row.rows.length === 0) {
      console.error(`User not found: ${u.email}`);
      continue;
    }
    const valid = await bcrypt.compare(u.password, row.rows[0].password_hash);
    console.log(`Verify ${u.email}: ${valid ? 'OK' : 'FAILED'}`);
  }

  console.log('Password fix complete!');
  process.exit(0);
}

fixPasswords().catch((e) => {
  console.error('Error:', e.message, e.stack);
  process.exit(1);
});
