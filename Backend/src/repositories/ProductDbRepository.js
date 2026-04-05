const DatabaseRepository = require('./DatabaseRepository');
const pool = require('../config/database');

class ProductDbRepository extends DatabaseRepository {
  constructor() {
    super('products');
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
      return result.rows;
    } catch (err) {
      console.error(`❌ Gabim në getAll products: ${err.message}`);
      return [];
    }
  }

  async getLowStock(minLevel = 5) {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE quantity < $1',
        [minLevel]
      );
      return result.rows;
    } catch (err) {
      return [];
    }
  }

  async getByCategory(category) {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE LOWER(category) = LOWER($1)',
        [category]
      );
      return result.rows;
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
      catResult.rows.forEach(r => { byCategory[r.category] = parseInt(r.count); });

      return {
        totalProducts: parseInt(stats.total_products),
        totalValue: parseFloat(parseFloat(stats.total_value).toFixed(2)),
        averagePrice: parseFloat(parseFloat(stats.average_price).toFixed(2)),
        maxPrice: parseFloat(stats.max_price),
        minPrice: parseFloat(stats.min_price),
        byCategory
      };
    } catch (err) {
      console.error(`❌ Gabim në getStatistics: ${err.message}`);
      throw err;
    }
  }
}

module.exports = ProductDbRepository;