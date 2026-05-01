require('dotenv').config();
const pool = require('./src/config/database');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('USERS TABLE SCHEMA:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
    });
    
    // Also check sample data
    const sampleData = await pool.query(`
      SELECT email, password_hash, is_active, name, role 
      FROM users 
      LIMIT 3
    `);
    
    console.log('\nSAMPLE USER DATA:');
    sampleData.rows.forEach(row => {
      console.log(`Email: ${row.email}, Has Password: ${!!row.password_hash}, Active: ${row.is_active}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
