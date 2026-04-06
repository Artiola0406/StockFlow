const CustomerRepository = require('../repositories/CustomerRepository');

class CustomerService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const CustomerDbRepository = require('../repositories/CustomerDbRepository');
      this.repository = new CustomerDbRepository();
      console.log('✅ Customers: duke përdorur PostgreSQL');
    } else {
      this.repository = new CustomerRepository();
      console.log('⚠️ Customers: duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  async getAllCustomers(filter) {
    try {
      return await Promise.resolve(this.repository.getAll(filter));
    } catch (err) {
      console.error(`❌ Gabim në getAllCustomers: ${err.message}`);
      return [];
    }
  }

  async getCustomerById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const row = await Promise.resolve(this.repository.getById(id));
    if (!row) throw new Error(`Klienti me ID "${id}" nuk u gjet`);
    return row;
  }

  async addCustomer(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i klientit është i detyrueshëm');
    if (!data.email || data.email.trim() === '')
      throw new Error('Email-i është i detyrueshëm');
    if (!data.phone || data.phone.trim() === '')
      throw new Error('Telefoni është i detyrueshëm');

    const customer = {
      id: Date.now().toString(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: (data.address || '').trim(),
      createdAt: new Date().toISOString(),
    };

    return await Promise.resolve(this.repository.add(customer));
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id);
    return await Promise.resolve(this.repository.update(id, data));
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id);
    return await Promise.resolve(this.repository.delete(id));
  }

  async getStatistics() {
    const all = await Promise.resolve(this.repository.getAll());
    return { total: all.length };
  }
}

module.exports = CustomerService;
