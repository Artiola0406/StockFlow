const WarehouseRepository = require('../repositories/WarehouseRepository');

class WarehouseService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const WarehouseDbRepository = require('../repositories/WarehouseDbRepository');
      this.repository = new WarehouseDbRepository();
      console.log('✅ Warehouses: duke përdorur PostgreSQL');
    } else {
      this.repository = new WarehouseRepository();
      console.log('⚠️ Warehouses: duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  async getAllWarehouses(filter) {
    try {
      return await Promise.resolve(this.repository.getAll(filter));
    } catch (err) {
      console.error(`❌ Gabim në getAllWarehouses: ${err.message}`);
      return [];
    }
  }

  async getWarehouseById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const warehouse = await Promise.resolve(this.repository.getById(id));
    if (!warehouse) throw new Error(`Depoja me ID "${id}" nuk u gjet`);
    return warehouse;
  }

  async addWarehouse(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i deposes është i detyrueshëm');
    if (!data.location || data.location.trim() === '')
      throw new Error('Lokacioni është i detyrueshëm');

    const capacity = parseInt(data.capacity, 10);
    if (data.capacity !== undefined && data.capacity !== '' && (isNaN(capacity) || capacity < 0))
      throw new Error('Kapaciteti duhet të jetë numër >= 0');

    const warehouse = {
      id: Date.now().toString(),
      name: data.name.trim(),
      location: data.location.trim(),
      capacity: Number.isNaN(capacity) ? 0 : capacity,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
    };

    return await Promise.resolve(this.repository.add(warehouse));
  }

  async updateWarehouse(id, data) {
    await this.getWarehouseById(id);

    if (data.capacity !== undefined) {
      const capacity = parseInt(data.capacity, 10);
      if (isNaN(capacity) || capacity < 0)
        throw new Error('Kapaciteti duhet të jetë numër >= 0');
      data.capacity = capacity;
    }

    if (data.name !== undefined && data.name.trim() === '')
      throw new Error('Emri i deposes nuk mund të jetë bosh');

    return await Promise.resolve(this.repository.update(id, data));
  }

  async deleteWarehouse(id) {
    await this.getWarehouseById(id);
    return await Promise.resolve(this.repository.delete(id));
  }

  async getStatistics() {
    if (typeof this.repository.getStatistics === 'function') {
      return await Promise.resolve(this.repository.getStatistics());
    }
    const warehouses = await Promise.resolve(this.repository.getAll());
    return {
      total: warehouses.length,
      active: warehouses.filter((w) => w.isActive === 'true' || w.isActive === true).length,
      totalCapacity: warehouses.reduce((sum, w) => sum + (parseInt(w.capacity, 10) || 0), 0),
    };
  }

  async getActiveWarehouses() {
    if (typeof this.repository.getActive === 'function') {
      return await Promise.resolve(this.repository.getActive());
    }
    const all = await Promise.resolve(this.repository.getAll());
    return all.filter((w) => w.isActive === 'true' || w.isActive === true);
  }
}

module.exports = WarehouseService;
