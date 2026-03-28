const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  constructor(repository) {
    this.repository = repository || new ProductRepository();
  }

  getAllProducts(filter) {
    const products = this.repository.getAll();
    if (filter) {
      return products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.category.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return products;
  }

  getProductById(id) {
    const product = this.repository.getById(id);
    if (!product) throw new Error(`Produkti me ID ${id} nuk u gjet`);
    return product;
  }

  addProduct(data) {
    if (!data.name || data.name.trim() === '')
      throw new Error('Emri i produktit eshte i detyrueshëm');
    if (!data.sku || data.sku.trim() === '')
      throw new Error('SKU eshte i detyrueshëm');
    if (!data.price || isNaN(data.price) || parseFloat(data.price) <= 0)
      throw new Error('Cmimi duhet te jete me i madh se 0');
    if (data.quantity === undefined || isNaN(data.quantity) || parseInt(data.quantity) < 0)
      throw new Error('Sasia nuk mund te jete negative');

    const product = {
      id: Date.now().toString(),
      name: data.name.trim(),
      sku: data.sku.trim(),
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
      category: data.category || 'E pacaktuar',
      createdAt: new Date().toISOString()
    };

    return this.repository.add(product);
  }

  updateProduct(id, data) {
    this.getProductById(id);
    if (data.price && parseFloat(data.price) <= 0)
      throw new Error('Cmimi duhet te jete me i madh se 0');
    if (data.quantity && parseInt(data.quantity) < 0)
      throw new Error('Sasia nuk mund te jete negative');
    return this.repository.update(id, data);
  }

  deleteProduct(id) {
    this.getProductById(id);
    return this.repository.delete(id);
  }
}

module.exports = ProductService;