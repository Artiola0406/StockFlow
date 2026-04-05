const WarehouseRepository = require('../repositories/WarehouseRepository');

class WarehouseService {
  constructor(repository) {
    this.repository = repository || new WarehouseRepository();
  }

  getAllWarehouses(filter) {
    try {
      let warehouses = this.repository.getAll();
      if (filter && filter.trim() !== '') {
        const f = filter.toLowerCase().trim();
        warehouses = warehouses.filter(w =>
          (w.name || '').toLowerCase().includes(f) ||
          (w.location || '').toLowerCase().includes(f)
        );
      }
      return warehouses;
    } catch (err) {
      console.error(`❌ Gabim në getAllWarehouses: ${err.message}`);
      return [];
    }
  }

  getWarehouseById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const warehouse = this.repository.getById(id);
    if (!warehouse) throw new Error(`Depoja me ID "${id}" nuk u gjet`);
    return warehouse;
  }

  addWarehouse(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i deposes është i detyrueshëm');
    if (!data.location || data.location.trim() === '')
      throw new Error('Lokacioni është i detyrueshëm');

    const capacity = parseInt(data.capacity);
    if (data.capacity !== undefined && (isNaN(capacity) || capacity < 0))
      throw new Error('Kapaciteti duhet të jetë numër >= 0');

    const warehouse = {
      id: Date.now().toString(),
      name: data.name.trim(),
      location: data.location.trim(),
      capacity: capacity || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString()
    };

    return this.repository.add(warehouse);
  }

  updateWarehouse(id, data) {
    this.getWarehouseById(id);

    if (data.capacity !== undefined) {
      const capacity = parseInt(data.capacity);
      if (isNaN(capacity) || capacity < 0)
        throw new Error('Kapaciteti duhet të jetë numër >= 0');
      data.capacity = capacity;
    }

    if (data.name !== undefined && data.name.trim() === '')
      throw new Error('Emri i deposes nuk mund të jetë bosh');

    return this.repository.update(id, data);
  }

  deleteWarehouse(id) {
    this.getWarehouseById(id);
    return this.repository.delete(id);
  }

  getStatistics() {
    const warehouses = this.repository.getAll();
    return {
      total: warehouses.length,
      active: warehouses.filter(w => w.isActive === 'true' || w.isActive === true).length,
      totalCapacity: warehouses.reduce((sum, w) => sum + (parseInt(w.capacity) || 0), 0)
    };
  }
}

module.exports = WarehouseService; 