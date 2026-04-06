const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  constructor(repository) {
    if (repository) {
      this.repository = repository;
    } else if (process.env.DATABASE_URL) {
      const ProductDbRepository = require('../repositories/ProductDbRepository');
      this.repository = new ProductDbRepository();
      console.log('✅ Products (service): duke përdorur PostgreSQL');
    } else {
      this.repository = new ProductRepository();
      console.log('⚠️ Products (service): duke përdorur CSV (pa DATABASE_URL)');
    }
  }

  _isPromise(x) {
    return x != null && typeof x.then === 'function';
  }

  getAllProducts(filter, sortBy, sortOrder) {
    try {
      const raw = this.repository.getAll(filter, sortBy, sortOrder);
      if (this._isPromise(raw)) {
        return raw;
      }
      let products = raw;
      if (filter && filter.trim() !== '') {
        const f = filter.toLowerCase().trim();
        products = products.filter(
          (p) =>
            (p.name || '').toLowerCase().includes(f) ||
            (p.category || '').toLowerCase().includes(f) ||
            (p.sku || '').toLowerCase().includes(f)
        );
      }
      if (sortBy) {
        products = this._sort(products, sortBy, sortOrder || 'asc');
      }
      return products;
    } catch (err) {
      console.error(`❌ Gabim në getAllProducts: ${err.message}`);
      return [];
    }
  }

  _sort(products, sortBy, sortOrder) {
    return [...products].sort((a, b) => {
      let valA;
      let valB;
      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortBy === 'price') {
        valA = parseFloat(a.price) || 0;
        valB = parseFloat(b.price) || 0;
      } else if (sortBy === 'quantity') {
        valA = parseInt(a.quantity, 10) || 0;
        valB = parseInt(b.quantity, 10) || 0;
      } else {
        return 0;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }

  getProductById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const r = this.repository.getById(id);
    if (this._isPromise(r)) {
      return r.then((product) => {
        if (!product) throw new Error(`Produkti me ID "${id}" nuk u gjet`);
        return product;
      });
    }
    if (!r) throw new Error(`Produkti me ID "${id}" nuk u gjet`);
    return r;
  }

  addProduct(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i produktit është i detyrueshëm');
    if (!data.sku || data.sku.trim() === '') throw new Error('SKU është i detyrueshëm');

    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0)
      throw new Error('Ju lutem shkruani numër valid për çmimin (duhet të jetë > 0)');

    const quantity = parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity < 0)
      throw new Error('Ju lutem shkruani numër valid për sasinë (duhet të jetë >= 0)');

    const product = {
      id: Date.now().toString(),
      name: data.name.trim(),
      sku: data.sku.trim(),
      price,
      quantity,
      category: (data.category || 'E pacaktuar').trim(),
      createdAt: new Date().toISOString(),
    };

    return this.repository.add(product);
  }

  updateProduct(id, data) {
    const step = this.getProductById(id);
    const run = () => {
      if (data.price !== undefined) {
        const price = parseFloat(data.price);
        if (isNaN(price) || price <= 0)
          throw new Error('Ju lutem shkruani numër valid për çmimin');
        data.price = price;
      }
      if (data.quantity !== undefined) {
        const quantity = parseInt(data.quantity, 10);
        if (isNaN(quantity) || quantity < 0)
          throw new Error('Ju lutem shkruani numër valid për sasinë');
        data.quantity = quantity;
      }
      return this.repository.update(id, data);
    };
    if (this._isPromise(step)) {
      return step.then(() => run());
    }
    return run();
  }

  deleteProduct(id) {
    const step = this.getProductById(id);
    const run = () => this.repository.delete(id);
    if (this._isPromise(step)) {
      return step.then(() => run());
    }
    return run();
  }

  _computeStatsFromList(products) {
    if (!products.length) {
      return {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        maxPriceProduct: null,
        minPriceProduct: null,
        byCategory: {},
      };
    }
    const prices = products.map((p) => parseFloat(p.price) || 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity, 10) || 0),
      0
    );
    const byCategory = {};
    products.forEach((p) => {
      const cat = p.category || 'E pacaktuar';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    const maxProduct = products.reduce((max, p) =>
      (parseFloat(p.price) || 0) > (parseFloat(max.price) || 0) ? p : max, products[0]);
    const minProduct = products.reduce((min, p) =>
      (parseFloat(p.price) || 0) < (parseFloat(min.price) || 0) ? p : min, products[0]);
    return {
      totalProducts: products.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      averagePrice: parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
      maxPriceProduct: maxProduct,
      minPriceProduct: minProduct,
      byCategory,
    };
  }

  calculateStatistics() {
    try {
      if (typeof this.repository.getStatistics === 'function') {
        const raw = this.repository.getStatistics();
        if (this._isPromise(raw)) {
          return raw.then((dbStats) => {
            if (!dbStats || dbStats.totalProducts === undefined) {
              return this._computeStatsFromList([]);
            }
            return {
              totalProducts: dbStats.totalProducts,
              totalValue: dbStats.totalValue,
              averagePrice: dbStats.averagePrice,
              maxPriceProduct: null,
              minPriceProduct: null,
              byCategory: dbStats.byCategory || {},
            };
          });
        }
      }
      const raw = this.repository.getAll(undefined, null, null);
      if (this._isPromise(raw)) {
        return raw.then((products) => this._computeStatsFromList(products));
      }
      return this._computeStatsFromList(raw);
    } catch (err) {
      console.error(`❌ Gabim në calculateStatistics: ${err.message}`);
      throw new Error('Gabim gjatë llogaritjes së statistikave');
    }
  }

  calculateAveragePrice() {
    const raw = this.repository.getAll(undefined, null, null);
    if (this._isPromise(raw)) {
      return raw.then((products) => {
        if (!products.length) return 0;
        const sum = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
        return parseFloat((sum / products.length).toFixed(2));
      });
    }
    if (!raw.length) return 0;
    const sum = raw.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
    return parseFloat((sum / raw.length).toFixed(2));
  }

  getMaxPriceProduct() {
    const raw = this.repository.getAll(undefined, null, null);
    if (this._isPromise(raw)) {
      return raw.then((products) => {
        if (!products.length) return null;
        return products.reduce((max, p) =>
          (parseFloat(p.price) || 0) > (parseFloat(max.price) || 0) ? p : max, products[0]);
      });
    }
    if (!raw.length) return null;
    return raw.reduce((max, p) =>
      (parseFloat(p.price) || 0) > (parseFloat(max.price) || 0) ? p : max, raw[0]);
  }

  getMinPriceProduct() {
    const raw = this.repository.getAll(undefined, null, null);
    if (this._isPromise(raw)) {
      return raw.then((products) => {
        if (!products.length) return null;
        return products.reduce((min, p) =>
          (parseFloat(p.price) || 0) < (parseFloat(min.price) || 0) ? p : min, products[0]);
      });
    }
    if (!raw.length) return null;
    return raw.reduce((min, p) =>
      (parseFloat(p.price) || 0) < (parseFloat(min.price) || 0) ? p : min, raw[0]);
  }
}

module.exports = ProductService;
