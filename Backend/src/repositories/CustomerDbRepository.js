const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class CustomerDbRepository extends DatabaseRepository {
  constructor() {
    super('customers');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      createdAt: row.created_at,
    };
  }

  async getAll(filter) {
    try {
      let query = 'SELECT * FROM customers';
      const params = [];
      if (filter && String(filter).trim() !== '') {
        query += ` WHERE LOWER(name) LIKE $1 OR LOWER(COALESCE(email,'')) LIKE $1 OR LOWER(COALESCE(phone,'')) LIKE $1`;
        params.push(`%${String(filter).toLowerCase().trim()}%`);
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll customers: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById customer: ${err.message}`);
      return null;
    }
  }

  async add(entity) {
    try {
      const result = await pool.query(
        `INSERT INTO customers (id, name, email, phone, address)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          String(entity.id),
          entity.name.trim(),
          (entity.email || '').trim(),
          (entity.phone || '').trim(),
          (entity.address || '').trim(),
        ]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add customer: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të klientit');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.email !== undefined) patch.email = data.email;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.address !== undefined) patch.address = data.address;
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE customers SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update customer: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit të klientit');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete customer: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes së klientit');
    }
  }
}

module.exports = CustomerDbRepository;
