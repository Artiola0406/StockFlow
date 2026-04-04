const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  constructor(repository) {
    this.repository = repository || new ProductRepository();
  }

  // ─── LISTO me filtrim dhe sortim ───
  getAllProducts(filter, sortBy, sortOrder) {
    try {
      let products = this.repository.getAll();

      // Filtrim case-insensitive
      if (filter && filter.trim() !== '') {
        const f = filter.toLowerCase().trim();
        products = products.filter(p =>
          (p.name || '').toLowerCase().includes(f) ||
          (p.category || '').toLowerCase().includes(f) ||
          (p.sku || '').toLowerCase().includes(f)
        );
      }

      // Sortim
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
      let valA, valB;
      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortBy === 'price') {
        valA = parseFloat(a.price) || 0;
        valB = parseFloat(b.price) || 0;
      }
      if (sortBy === 'quantity') {
        valA = parseInt(a.quantity) || 0;
        valB = parseInt(b.quantity) || 0;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }

  // ─── GJEJ sipas ID ───
  getProductById(id) {
    if (!id) throw new Error('ID është e detyrueshme');
    const product = this.repository.getById(id);
    if (!product) throw new Error(`Produkti me ID "${id}" nuk u gjet`);
    return product;
  }

  // ─── SHTO me validim ───
  addProduct(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i produktit është i detyrueshëm');
    if (!data.sku || data.sku.trim() === '')
      throw new Error('SKU është i detyrueshëm');

    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0)
      throw new Error('Ju lutem shkruani numër valid për çmimin (duhet të jetë > 0)');

    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity < 0)
      throw new Error('Ju lutem shkruani numër valid për sasinë (duhet të jetë >= 0)');

    const product = {
      id: Date.now().toString(),
      name: data.name.trim(),
      sku: data.sku.trim(),
      price: price,
      quantity: quantity,
      category: (data.category || 'E pacaktuar').trim(),
      createdAt: new Date().toISOString()
    };

    return this.repository.add(product);
  }

  // ─── PËRDITËSO ───
  updateProduct(id, data) {
    this.getProductById(id);

    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0)
        throw new Error('Ju lutem shkruani numër valid për çmimin');
      data.price = price;
    }

    if (data.quantity !== undefined) {
      const quantity = parseInt(data.quantity);
      if (isNaN(quantity) || quantity < 0)
        throw new Error('Ju lutem shkruani numër valid për sasinë');
      data.quantity = quantity;
    }

    return this.repository.update(id, data);
  }

  // ─── FSHI ───
  deleteProduct(id) {
    this.getProductById(id);
    return this.repository.delete(id);
  }

  // ─── STATISTIKA ───
  calculateStatistics() {
    try {
      const products = this.repository.getAll();

      if (products.length === 0) {
        return {
          totalProducts: 0,
          totalValue: 0,
          averagePrice: 0,
          maxPriceProduct: null,
          minPriceProduct: null,
          byCategory: {}
        };
      }

      const prices = products.map(p => parseFloat(p.price) || 0);
      const totalValue = products.reduce((sum, p) =>
        sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0), 0);

      const byCategory = {};
      products.forEach(p => {
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
        byCategory
      };
    } catch (err) {
      console.error(`❌ Gabim në calculateStatistics: ${err.message}`);
      throw new Error('Gabim gjatë llogaritjes së statistikave');
    }
  }

  calculateAveragePrice() {
    const products = this.repository.getAll();
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
    return parseFloat((sum / products.length).toFixed(2));
  }

  getMaxPriceProduct() {
    const products = this.repository.getAll();
    if (products.length === 0) return null;
    return products.reduce((max, p) =>
      (parseFloat(p.price) || 0) > (parseFloat(max.price) || 0) ? p : max, products[0]);
  }

  getMinPriceProduct() {
    const products = this.repository.getAll();
    if (products.length === 0) return null;
    return products.reduce((min, p) =>
      (parseFloat(p.price) || 0) < (parseFloat(min.price) || 0) ? p : min, products[0]);
  }
}

module.exports = ProductService;