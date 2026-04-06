const FileRepository = require('./FileRepository');

class SupplierRepository extends FileRepository {
  constructor() {
    super('suppliers.csv');
  }

  getAll(filter) {
    let rows = super.getAll();
    if (filter && String(filter).trim() !== '') {
      const f = String(filter).toLowerCase().trim();
      rows = rows.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(f) ||
          (s.email || '').toLowerCase().includes(f) ||
          (s.phone || '').toLowerCase().includes(f)
      );
    }
    return rows;
  }

  getActive() {
    return this.getAll().filter((s) => s.isActive === 'true' || s.isActive === true);
  }
}

module.exports = SupplierRepository;
