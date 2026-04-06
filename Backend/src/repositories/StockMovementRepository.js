const FileRepository = require('./FileRepository');

class StockMovementRepository extends FileRepository {
  constructor() {
    super('stockmovements.csv');
  }

  getByType(type) {
    return this.getAll().filter((m) => m.type === type);
  }

  getStatistics() {
    const all = this.getAll();
    return {
      total: all.length,
      totalIN: all.filter((m) => m.type === 'IN').length,
      totalOUT: all.filter((m) => m.type === 'OUT').length,
    };
  }
}

module.exports = StockMovementRepository;
