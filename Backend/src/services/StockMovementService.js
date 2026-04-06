const StockMovementRepository = require('../repositories/StockMovementRepository');

class StockMovementService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const StockMovementDbRepository = require('../repositories/StockMovementDbRepository');
      this.repository = new StockMovementDbRepository();
      console.log('✅ Stock movements: duke përdorur PostgreSQL');
    } else {
      this.repository = new StockMovementRepository();
      console.log('⚠️ Stock movements: duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  async getAllMovements() {
    try {
      return await Promise.resolve(this.repository.getAll());
    } catch (err) {
      console.error(`❌ Gabim në getAllMovements: ${err.message}`);
      return [];
    }
  }

  async getMovementsByType(type) {
    if (type !== 'IN' && type !== 'OUT')
      throw new Error('Lloji duhet të jetë IN ose OUT');
    try {
      return await Promise.resolve(this.repository.getByType(type));
    } catch (err) {
      console.error(`❌ Gabim në getMovementsByType: ${err.message}`);
      return [];
    }
  }

  async getMovementById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const row = await Promise.resolve(this.repository.getById(id));
    if (!row) throw new Error(`Lëvizja me ID "${id}" nuk u gjet`);
    return row;
  }

  async addMovement(data) {
    if (!data.productName || data.productName.trim() === '')
      throw new Error('Emri i produktit është i detyrueshëm');
    if (!data.warehouseName || data.warehouseName.trim() === '')
      throw new Error('Emri i deposes është i detyrueshëm');
    if (data.type !== 'IN' && data.type !== 'OUT')
      throw new Error('Lloji duhet të jetë IN ose OUT');
    const quantity = parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity <= 0)
      throw new Error('Sasia duhet të jetë numër pozitiv');

    const movement = {
      id: Date.now().toString(),
      productName: data.productName.trim(),
      warehouseName: data.warehouseName.trim(),
      type: data.type,
      quantity,
      reason: (data.reason || '').trim(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return await Promise.resolve(this.repository.add(movement));
  }

  async updateMovement(id, data) {
    await this.getMovementById(id);
    if (data.type !== undefined && data.type !== 'IN' && data.type !== 'OUT')
      throw new Error('Lloji duhet të jetë IN ose OUT');
    return await Promise.resolve(this.repository.update(id, data));
  }

  async deleteMovement(id) {
    await this.getMovementById(id);
    return await Promise.resolve(this.repository.delete(id));
  }

  async getStatistics() {
    if (typeof this.repository.getStatistics === 'function') {
      return await Promise.resolve(this.repository.getStatistics());
    }
    const all = await Promise.resolve(this.repository.getAll());
    return {
      total: all.length,
      totalIN: all.filter((m) => m.type === 'IN').length,
      totalOUT: all.filter((m) => m.type === 'OUT').length,
    };
  }
}

module.exports = StockMovementService;
