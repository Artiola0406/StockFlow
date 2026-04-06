const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class SupplierDbRepository extends DatabaseRepository {
  constructor() {
    super('suppliers');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.contact_email,
      phone: row.phone,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async getAll(filter) {
    try {
      let query = 'SELECT * FROM suppliers';
      const params = [];
      if (filter && String(filter).trim() !== '') {
        query += ` WHERE LOWER(name) LIKE $1 OR LOWER(COALESCE(contact_email,'')) LIKE $1 OR LOWER(COALESCE(phone,'')) LIKE $1`;
        params.push(`%${String(filter).toLowerCase().trim()}%`);
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll suppliers: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById supplier: ${err.message}`);
      return null;
    }
  }

  async getActive() {
    try {
      const result = await pool.query(
        'SELECT * FROM suppliers WHERE is_active = true ORDER BY created_at DESC'
      );
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getActive suppliers: ${err.message}`);
      return [];
    }
  }

  async add(entity) {
    try {
      const result = await pool.query(
        `INSERT INTO suppliers (id, name, contact_email, phone, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          String(entity.id),
          entity.name.trim(),
          (entity.email || '').trim(),
          (entity.phone || '').trim(),
          entity.isActive !== undefined ? Boolean(entity.isActive) : true,
        ]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add supplier: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të furnitorit');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.email !== undefined) patch.contact_email = data.email;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.isActive !== undefined) patch.is_active = Boolean(data.isActive);
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE suppliers SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update supplier: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit të furnitorit');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete supplier: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes së furnitorit');
    }
  }
}

module.exports = SupplierDbRepository;
