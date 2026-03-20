class IRepository {
  getAll() { throw new Error('getAll() must be implemented'); }
  getById(id) { throw new Error('getById() must be implemented'); }
  add(entity) { throw new Error('add() must be implemented'); }
  save() { throw new Error('save() must be implemented'); }
}

module.exports = IRepository;
