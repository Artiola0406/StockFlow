const fs = require('fs');
const path = require('path');
const IRepository = require('./IRepository');

class FileRepository extends IRepository {
  constructor(filename) {
    super();
    // path.resolve siguron që rruga të jetë absolute dhe e saktë
    this.filepath = path.resolve(__dirname, '../../data', filename);
    this.data = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const content = fs.readFileSync(this.filepath, 'utf-8');
        // Ndajmë rreshtat dhe heqim ata që janë bosh
        const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');
        
        if (lines.length > 0) {
          // I kthejmë header-at në shkronja të vogla (id, name, sku...)
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          this.data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => {
              // Sigurohemi që vlera ekziston, përndryshe vendosim string bosh
              obj[h] = values[i] ? values[i].trim() : "";
            });
            return obj;
          });
          console.log(`✅ U ngarkuan ${this.data.length} produkte nga ${this.filepath}`);
        }
      } else {
        console.error(`❌ Skedari nuk u gjet në: ${this.filepath}`);
      }
    } catch (error) {
      console.error("❌ Gabim gjatë ngarkimit të CSV:", error);
      this.data = [];
    }
  }

  getAll() {
    return this.data;
  }

  getById(id) {
    return this.data.find(item => String(item.id) === String(id)) || null;
  }

  add(entity) {
    this.data.push(entity);
    this.save();
    return entity;
  }

  update(id, updatedEntity) {
    const index = this.data.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;
    this.data[index] = { ...this.data[index], ...updatedEntity };
    this.save();
    return this.data[index];
  }

  delete(id) {
    const index = this.data.findIndex(item => String(item.id) === String(id));
    if (index === -1) return false;
    this.data.splice(index, 1);
    this.save();
    return true;
  }

  save() {
    try {
      if (this.data.length === 0) {
        // Nëse s'ka të dhëna, mund të ruajmë vetëm header-at nëse dëshironi
        return;
      }
      const headers = Object.keys(this.data[0]).join(',');
      const rows = this.data.map(item => Object.values(item).join(','));
      fs.writeFileSync(this.filepath, [headers, ...rows].join('\n'), 'utf-8');
    } catch (error) {
      console.error("❌ Gabim gjatë ruajtjes së CSV:", error);
    }
  }
}

module.exports = FileRepository;