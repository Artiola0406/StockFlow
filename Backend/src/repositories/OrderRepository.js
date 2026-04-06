const FileRepository = require('./FileRepository');

class OrderRepository extends FileRepository {
  constructor() {
    super('orders.csv');
  }

  getByStatus(status) {
    return this.getAll().filter((o) => o.status === status);
  }
}

module.exports = OrderRepository;
