const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class OrderDbRepository extends DatabaseRepository {
  constructor() {
    super('orders');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      customerName: row.customer_name,
      productName: row.product_name,
      quantity: row.quantity,
      totalAmount: row.total_amount != null ? String(row.total_amount) : '0',
      status: row.status,
      date: row.created_at ? new Date(row.created_at).toISOString() : null,
      createdAt: row.created_at,
    };
  }

  async getAll() {
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll orders: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById order: ${err.message}`);
      return null;
    }
  }

  async getByStatus(status) {
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
        [status]
      );
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getByStatus orders: ${err.message}`);
      return [];
    }
  }

  async add(entity) {
    try {
      const result = await pool.query(
        `INSERT INTO orders (id, customer_name, product_name, quantity, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          String(entity.id),
          entity.customerName.trim(),
          entity.productName.trim(),
          parseInt(entity.quantity, 10),
          parseFloat(entity.totalAmount),
          entity.status || 'Ne pritje',
        ]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add order: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të porosisë');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.customerName !== undefined) patch.customer_name = data.customerName;
    if (data.productName !== undefined) patch.product_name = data.productName;
    if (data.quantity !== undefined) patch.quantity = parseInt(data.quantity, 10);
    if (data.totalAmount !== undefined) patch.total_amount = parseFloat(data.totalAmount);
    if (data.status !== undefined) patch.status = data.status;
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE orders SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update order: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit të porosisë');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete order: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes së porosisë');
    }
  }
}

module.exports = OrderDbRepository;
