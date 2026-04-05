const IRepository = require('./IRepository');
const pool = require('../config/database');

class DatabaseRepository extends IRepository {
  constructor(tableName) {
    super();
    this.tableName = tableName;
  }

  async getAll() {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (err) {
      console.error(`❌ Gabim në getAll (${this.tableName}): ${err.message}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error(`❌ Gabim në getById: ${err.message}`);
      return null;
    }
  }

  async add(entity) {
    try {
      const keys = Object.keys(entity);
      const values = Object.values(entity);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.join(', ');

      const result = await pool.query(
        `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    } catch (err) {
      console.error(`❌ Gabim në add: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të të dhënave');
    }
  }

  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error(`❌ Gabim në update: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit');
    }
  }

  async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rows.length > 0;
    } catch (err) {
      console.error(`❌ Gabim në delete: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes');
    }
  }

  save() {
    // PostgreSQL ruan automatikisht — nuk nevojitet
  }
}

module.exports = DatabaseRepository;