const FileRepository = require('./FileRepository');

class WarehouseRepository extends FileRepository {
  constructor() {
    super('warehouses.csv');
  }

  getAll(filter) {
    let warehouses = super.getAll();
    if (filter && String(filter).trim() !== '') {
      const f = String(filter).toLowerCase().trim();
      warehouses = warehouses.filter(
        (w) =>
          (w.name || '').toLowerCase().includes(f) ||
          (w.location || '').toLowerCase().includes(f)
      );
    }
    return warehouses;
  }

  getActive() {
    return super.getAll().filter((w) => w.isActive === 'true' || w.isActive === true);
  }

  getByLocation(location) {
    return super.getAll().filter((w) =>
      (w.location || '').toLowerCase().includes(location.toLowerCase())
    );
  }
}

module.exports = WarehouseRepository;
