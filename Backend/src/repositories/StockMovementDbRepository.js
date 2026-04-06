const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class StockMovementDbRepository extends DatabaseRepository {
  constructor() {
    super('stock_movements');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      productName: row.product_name,
      warehouseName: row.warehouse_name,
      type: row.type,
      quantity: row.quantity,
      reason: row.reason,
      date: row.created_at ? new Date(row.created_at).toISOString() : null,
      createdAt: row.created_at,
    };
  }

  async getAll() {
    try {
      const result = await pool.query('SELECT * FROM stock_movements ORDER BY created_at DESC');
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll stock_movements: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM stock_movements WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById stock_movement: ${err.message}`);
      return null;
    }
  }

  async getByType(type) {
    try {
      const result = await pool.query(
        'SELECT * FROM stock_movements WHERE type = $1 ORDER BY created_at DESC',
        [type]
      );
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getByType stock_movements: ${err.message}`);
      return [];
    }
  }

  async getStatistics() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE type = 'IN')::int AS total_in,
          COUNT(*) FILTER (WHERE type = 'OUT')::int AS total_out
        FROM stock_movements
      `);
      const row = result.rows[0];
      return {
        total: parseInt(row.total, 10),
        totalIN: parseInt(row.total_in, 10),
        totalOUT: parseInt(row.total_out, 10),
      };
    } catch (err) {
      console.error(`❌ Gabim në getStatistics stock_movements: ${err.message}`);
      throw new Error('Gabim gjatë llogaritjes së statistikave të lëvizjeve');
    }
  }

  async add(entity) {
    try {
      const result = await pool.query(
        `INSERT INTO stock_movements (id, product_name, warehouse_name, type, quantity, reason)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          String(entity.id),
          entity.productName.trim(),
          (entity.warehouseName || '').trim(),
          entity.type,
          parseInt(entity.quantity, 10),
          (entity.reason || '').trim(),
        ]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add stock_movement: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të lëvizjes së stokut');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.productName !== undefined) patch.product_name = data.productName;
    if (data.warehouseName !== undefined) patch.warehouse_name = data.warehouseName;
    if (data.type !== undefined) patch.type = data.type;
    if (data.quantity !== undefined) patch.quantity = parseInt(data.quantity, 10);
    if (data.reason !== undefined) patch.reason = data.reason;
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE stock_movements SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update stock_movement: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit të lëvizjes');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM stock_movements WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete stock_movement: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes së lëvizjes');
    }
  }
}

module.exports = StockMovementDbRepository;
