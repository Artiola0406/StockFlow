const FileRepository = require('./FileRepository');

class WarehouseRepository extends FileRepository {
  constructor() {
    super('warehouses.csv');
  }

  getActive() {
    return this.getAll().filter(w => w.isActive === 'true' || w.isActive === true);
  }

  getByLocation(location) {
    return this.getAll().filter(w =>
      (w.location || '').toLowerCase().includes(location.toLowerCase())
    );
  }
}

module.exports = WarehouseRepository;