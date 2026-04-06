const FileRepository = require('./FileRepository');

class CustomerRepository extends FileRepository {
  constructor() {
    super('customers.csv');
  }

  getAll(filter) {
    let rows = super.getAll();
    if (filter && String(filter).trim() !== '') {
      const f = String(filter).toLowerCase().trim();
      rows = rows.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(f) ||
          (c.email || '').toLowerCase().includes(f) ||
          (c.phone || '').toLowerCase().includes(f)
      );
    }
    return rows;
  }
}

module.exports = CustomerRepository;
