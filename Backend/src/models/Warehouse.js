class Warehouse {
  constructor(id, name, location, capacity, isActive) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.capacity = capacity;
    this.isActive = isActive;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = Warehouse;