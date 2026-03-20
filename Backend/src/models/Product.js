class Product {
  constructor(id, name, sku, category, quantity, minStock, price) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.category = category;
    this.quantity = quantity;
    this.minStock = minStock;
    this.price = price;
  }
}

module.exports = Product;