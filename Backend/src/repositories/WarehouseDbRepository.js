const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class WarehouseDbRepository extends DatabaseRepository {
  constructor() {
    super('warehouses');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      capacity: row.capacity != null ? parseInt(row.capacity, 10) : 0,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async getAll(filter) {
    try {
      let query = 'SELECT * FROM warehouses';
      const params = [];
      if (filter && String(filter).trim() !== '') {
        query += ' WHERE LOWER(name) LIKE $1 OR LOWER(COALESCE(location,\'\')) LIKE $1';
        params.push(`%${String(filter).toLowerCase().trim()}%`);
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll warehouses: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM warehouses WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById warehouse: ${err.message}`);
      return null;
    }
  }

  async getActive() {
    try {
      const result = await pool.query(
        'SELECT * FROM warehouses WHERE is_active = true ORDER BY created_at DESC'
      );
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getActive warehouses: ${err.message}`);
      return [];
    }
  }

  async getStatistics() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE is_active = true)::int AS active,
          COALESCE(SUM(capacity), 0)::bigint AS total_capacity
        FROM warehouses
      `);
      const row = result.rows[0];
      return {
        total: parseInt(row.total, 10),
        active: parseInt(row.active, 10),
        totalCapacity: parseInt(row.total_capacity, 10),
      };
    } catch (err) {
      console.error(`❌ Gabim në getStatistics warehouses: ${err.message}`);
      throw new Error('Gabim gjatë llogaritjes së statistikave të depove');
    }
  }

  async add(entity) {
    const id = String(entity.id);
    const name = entity.name.trim();
    const location = (entity.location || '').trim();
    const capacity = parseInt(entity.capacity, 10) || 0;
    const isActive = entity.isActive !== undefined ? Boolean(entity.isActive) : true;
    try {
      const result = await pool.query(
        `INSERT INTO warehouses (id, name, location, capacity, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id, name, location, capacity, isActive]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add warehouse: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të deposes');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.location !== undefined) patch.location = data.location;
    if (data.capacity !== undefined) patch.capacity = parseInt(data.capacity, 10);
    if (data.isActive !== undefined) patch.is_active = Boolean(data.isActive);
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE warehouses SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update warehouse: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit të deposes');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM warehouses WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete warehouse: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes së deposes');
    }
  }
}

module.exports = WarehouseDbRepository;
