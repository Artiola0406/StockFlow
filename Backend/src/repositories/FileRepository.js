const fs = require('fs');
const path = require('path');
const IRepository = require('./IRepository');

class FileRepository extends IRepository {
  constructor(filename) {
    super();
    this.filepath = path.join(__dirname, '../../data/', filename);
    this.data = [];
    this._load();
  }

  _load() {
    if (fs.existsSync(this.filepath)) {
      const content = fs.readFileSync(this.filepath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
        const headers = lines[0].split(',');
        this.data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
          return obj;
        });
      }
    }
  }

  getAll() {
    return this.data;
  }

  getById(id) {
    return this.data.find(item => item.id === id) || null;
  }

  add(entity) {
    this.data.push(entity);
    this.save();
    return entity;
  }

  save() {
    if (this.data.length === 0) return;
    const headers = Object.keys(this.data[0]).join(',');
    const rows = this.data.map(item => Object.values(item).join(','));
    fs.writeFileSync(this.filepath, [headers, ...rows].join('\n'), 'utf-8');
  }
}

module.exports = FileRepository;