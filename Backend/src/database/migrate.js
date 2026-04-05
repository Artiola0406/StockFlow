const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('🔄 Duke ekzekutuar migrimin...');
    const sql = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    await pool.query(sql);
    console.log('✅ Migrimi u krye me sukses!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gabim gjatë migrimit:', err.message);
    process.exit(1);
  }
}

migrate();