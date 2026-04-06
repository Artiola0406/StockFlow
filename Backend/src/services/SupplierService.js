const SupplierRepository = require('../repositories/SupplierRepository');

class SupplierService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const SupplierDbRepository = require('../repositories/SupplierDbRepository');
      this.repository = new SupplierDbRepository();
      console.log('✅ Suppliers: duke përdorur PostgreSQL');
    } else {
      this.repository = new SupplierRepository();
      console.log('⚠️ Suppliers: duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  async getAllSuppliers(filter) {
    try {
      return await Promise.resolve(this.repository.getAll(filter));
    } catch (err) {
      console.error(`❌ Gabim në getAllSuppliers: ${err.message}`);
      return [];
    }
  }

  async getSupplierById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const row = await Promise.resolve(this.repository.getById(id));
    if (!row) throw new Error(`Furnitori me ID "${id}" nuk u gjet`);
    return row;
  }

  async addSupplier(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i furnitorit është i detyrueshëm');
    if (!data.email || data.email.trim() === '')
      throw new Error('Email-i është i detyrueshëm');
    if (!data.phone || data.phone.trim() === '')
      throw new Error('Telefoni është i detyrueshëm');

    const supplier = {
      id: Date.now().toString(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
    };

    return await Promise.resolve(this.repository.add(supplier));
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);
    return await Promise.resolve(this.repository.update(id, data));
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);
    return await Promise.resolve(this.repository.delete(id));
  }

  async getActiveSuppliers() {
    if (typeof this.repository.getActive === 'function') {
      return await Promise.resolve(this.repository.getActive());
    }
    const all = await Promise.resolve(this.repository.getAll());
    return all.filter((s) => s.isActive === 'true' || s.isActive === true);
  }

  async getStatistics() {
    const all = await Promise.resolve(this.repository.getAll());
    return {
      total: all.length,
      active: all.filter((s) => s.isActive === 'true' || s.isActive === true).length,
    };
  }
}

module.exports = SupplierService;
