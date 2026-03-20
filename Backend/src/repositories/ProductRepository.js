const FileRepository = require('./FileRepository');

class ProductRepository extends FileRepository {
  constructor() {
    super('products.csv');
  }

  getByCategory(category) {
    return this.getAll().filter(p => p.category === category);
  }

  getLowStock(minLevel) {
    return this.getAll().filter(p => parseInt(p.quantity) < parseInt(minLevel));
  }
}

module.exports = ProductRepository;