const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class ProductDbRepository extends DatabaseRepository {
  constructor() {
    super('products');
  }

  _fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      price: row.price != null ? parseFloat(row.price) : 0,
      quantity: row.quantity != null ? parseInt(row.quantity, 10) : 0,
      category: row.category,
      createdAt: row.created_at,
    };
  }

  async getAll(filter, sortBy, sortOrder) {
    try {
      let query = 'SELECT * FROM products';
      const params = [];

      if (filter) {
        query += ` WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1 OR LOWER(sku) LIKE $1`;
        params.push(`%${filter.toLowerCase()}%`);
      }

      const validSort = ['name', 'price', 'quantity', 'created_at'];
      const validOrder = ['asc', 'desc'];
      const sort = validSort.includes(sortBy) ? sortBy : 'created_at';
      const order = validOrder.includes(sortOrder) ? sortOrder : 'desc';

      query += ` ORDER BY ${sort} ${order}`;

      const result = await pool.query(query, params);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      console.error(`❌ Gabim në getAll products: ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në getById product: ${err.message}`);
      return null;
    }
  }

  async add(entity) {
    try {
      const result = await pool.query(
        `INSERT INTO products (id, name, sku, price, quantity, category)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          String(entity.id),
          entity.name,
          entity.sku,
          entity.price,
          entity.quantity,
          entity.category || 'E pacaktuar',
        ]
      );
      return this._fromRow(result.rows[0]);
    } catch (err) {
      console.error(`❌ Gabim në add product: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të të dhënave');
    }
  }

  async update(id, data) {
    const patch = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.sku !== undefined) patch.sku = data.sku;
    if (data.price !== undefined) patch.price = data.price;
    if (data.quantity !== undefined) patch.quantity = data.quantity;
    if (data.category !== undefined) patch.category = data.category;
    const keys = Object.keys(patch);
    if (keys.length === 0) return this.getById(id);
    const values = Object.values(patch);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    try {
      const result = await pool.query(
        `UPDATE products SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return this._fromRow(result.rows[0] || null);
    } catch (err) {
      console.error(`❌ Gabim në update product: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete product: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes');
    }
  }

  async getLowStock(minLevel = 5) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE quantity < $1', [minLevel]);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      return [];
    }
  }

  async getByCategory(category) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE LOWER(category) = LOWER($1)', [
        category,
      ]);
      return result.rows.map((r) => this._fromRow(r));
    } catch (err) {
      return [];
    }
  }

  async getStatistics() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_products,
          COALESCE(SUM(price * quantity), 0) as total_value,
          COALESCE(AVG(price), 0) as average_price,
          COALESCE(MAX(price), 0) as max_price,
          COALESCE(MIN(price), 0) as min_price
        FROM products
      `);

      const catResult = await pool.query(`
        SELECT category, COUNT(*) as count
        FROM products
        GROUP BY category
        ORDER BY count DESC
      `);

      const stats = result.rows[0];
      const byCategory = {};
      catResult.rows.forEach((r) => {
        byCategory[r.category] = parseInt(r.count, 10);
      });

      return {
        totalProducts: parseInt(stats.total_products, 10),
        totalValue: parseFloat(parseFloat(stats.total_value).toFixed(2)),
        averagePrice: parseFloat(parseFloat(stats.average_price).toFixed(2)),
        maxPrice: parseFloat(stats.max_price),
        minPrice: parseFloat(stats.min_price),
        byCategory,
      };
    } catch (err) {
      console.error(`❌ Gabim në getStatistics: ${err.message}`);
      throw err;
    }
  }
}

module.exports = ProductDbRepository;
