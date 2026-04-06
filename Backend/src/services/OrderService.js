const OrderRepository = require('../repositories/OrderRepository');

class OrderService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const OrderDbRepository = require('../repositories/OrderDbRepository');
      this.repository = new OrderDbRepository();
      console.log('✅ Orders: duke përdorur PostgreSQL');
    } else {
      this.repository = new OrderRepository();
      console.log('⚠️ Orders: duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  async getAllOrders() {
    try {
      return await Promise.resolve(this.repository.getAll());
    } catch (err) {
      console.error(`❌ Gabim në getAllOrders: ${err.message}`);
      return [];
    }
  }

  async getOrdersByStatus(status) {
    try {
      return await Promise.resolve(this.repository.getByStatus(status));
    } catch (err) {
      console.error(`❌ Gabim në getOrdersByStatus: ${err.message}`);
      return [];
    }
  }

  async getOrderById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const row = await Promise.resolve(this.repository.getById(id));
    if (!row) throw new Error(`Porosia me ID "${id}" nuk u gjet`);
    return row;
  }

  async addOrder(data) {
    if (!data.customerName || data.customerName.trim() === '')
      throw new Error('Emri i klientit është i detyrueshëm');
    if (!data.productName || data.productName.trim() === '')
      throw new Error('Emri i produktit është i detyrueshëm');
    const quantity = parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity <= 0)
      throw new Error('Sasia duhet të jetë numër pozitiv');
    const totalAmount = parseFloat(data.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0)
      throw new Error('Totali duhet të jetë numër pozitiv');

    const order = {
      id: Date.now().toString(),
      customerName: data.customerName.trim(),
      productName: data.productName.trim(),
      quantity,
      totalAmount,
      status: data.status || 'Ne pritje',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return await Promise.resolve(this.repository.add(order));
  }

  async updateOrder(id, data) {
    await this.getOrderById(id);
    return await Promise.resolve(this.repository.update(id, data));
  }

  async deleteOrder(id) {
    await this.getOrderById(id);
    return await Promise.resolve(this.repository.delete(id));
  }

  async getStatistics() {
    const all = await Promise.resolve(this.repository.getAll());
    return {
      total: all.length,
      confirmed: all.filter((o) => o.status === 'Konfirmuar').length,
      pending: all.filter((o) => o.status === 'Ne pritje').length,
    };
  }
}

module.exports = OrderService;
