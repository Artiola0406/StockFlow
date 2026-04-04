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
    try {
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
          console.log(`✅ U ngarkuan ${this.data.length} rekorde nga ${this.filepath}`);
        }
      } else {
        console.log(`⚠️ File nuk u gjet, po krijoj file të ri: ${this.filepath}`);
        this._createEmptyFile();
      }
    } catch (err) {
      console.error(`❌ Gabim gjatë leximit të file: ${err.message}`);
      console.log('Po vazhdoj me listë të zbrazët...');
      this.data = [];
    }
  }

  _createEmptyFile() {
    try {
      const dir = path.dirname(this.filepath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filepath, '', 'utf-8');
      this.data = [];
    } catch (err) {
      console.error(`❌ Gabim gjatë krijimit të file: ${err.message}`);
      this.data = [];
    }
  }

  getAll() {
    return this.data;
  }

  getById(id) {
    try {
      const item = this.data.find(item => item.id === String(id));
      return item || null;
    } catch (err) {
      console.error(`❌ Gabim në getById: ${err.message}`);
      return null;
    }
  }

  add(entity) {
    try {
      this.data.push(entity);
      this.save();
      return entity;
    } catch (err) {
      console.error(`❌ Gabim në add: ${err.message}`);
      throw new Error('Gabim gjatë shtimit të rekordeve');
    }
  }

  update(id, updatedEntity) {
    try {
      const index = this.data.findIndex(item => item.id === String(id));
      if (index === -1) return null;
      this.data[index] = { ...this.data[index], ...updatedEntity };
      this.save();
      return this.data[index];
    } catch (err) {
      console.error(`❌ Gabim në update: ${err.message}`);
      throw new Error('Gabim gjatë përditësimit');
    }
  }

  delete(id) {
    try {
      const index = this.data.findIndex(item => item.id === String(id));
      if (index === -1) return false;
      this.data.splice(index, 1);
      this.save();
      return true;
    } catch (err) {
      console.error(`❌ Gabim në delete: ${err.message}`);
      throw new Error('Gabim gjatë fshirjes');
    }
  }

  save() {
    try {
      if (this.data.length === 0) {
        fs.writeFileSync(this.filepath, '', 'utf-8');
        return;
      }
      const headers = Object.keys(this.data[0]).join(',');
      const rows = this.data.map(item => Object.values(item).join(','));
      fs.writeFileSync(this.filepath, [headers, ...rows].join('\n'), 'utf-8');
    } catch (err) {
      console.error(`❌ Gabim gjatë ruajtjes: ${err.message}`);
      throw new Error('File nuk mund të ruhet');
    }
  }
}

module.exports = FileRepository;