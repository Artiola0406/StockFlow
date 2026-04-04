const ProductService = require('../src/services/ProductService');

// Mock Repository — nuk perdor CSV real
const createMockRepo = (initialData = []) => ({
  data: [...initialData],
  getAll() { return this.data; },
  getById(id) { return this.data.find(x => x.id === String(id)) || null; },
  add(entity) { this.data.push(entity); return entity; },
  update(id, updated) {
    const i = this.data.findIndex(x => x.id === String(id));
    if (i === -1) return null;
    this.data[i] = { ...this.data[i], ...updated };
    return this.data[i];
  },
  delete(id) {
    const i = this.data.findIndex(x => x.id === String(id));
    if (i === -1) return false;
    this.data.splice(i, 1);
    return true;
  },
  save() {}
});

const sampleProducts = [
  { id: '1', name: 'Laptop Dell XPS', sku: 'SKU-001', price: '999.99', quantity: '15', category: 'Elektronike' },
  { id: '2', name: 'Monitor Samsung', sku: 'SKU-002', price: '349.99', quantity: '8', category: 'Elektronike' },
  { id: '3', name: 'Karrige Zyreje', sku: 'SKU-003', price: '249.99', quantity: '10', category: 'Mobilje' },
  { id: '4', name: 'Tastiere Logitech', sku: 'SKU-004', price: '79.99', quantity: '25', category: 'Aksesore' },
  { id: '5', name: 'Printer HP', sku: 'SKU-005', price: '189.99', quantity: '6', category: 'Elektronike' }
];

// ─── TESTI 1: addProduct — produkt valid ───
test('addProduct me të dhëna valide duhet të kthejë produktin', () => {
  const service = new ProductService(createMockRepo());
  const result = service.addProduct({
    name: 'iPhone 17',
    sku: 'SKU-006',
    price: 1299,
    quantity: 5,
    category: 'Elektronike'
  });
  expect(result).toBeDefined();
  expect(result.name).toBe('iPhone 17');
  expect(result.id).toBeDefined();
});

// ─── TESTI 2: addProduct — emër bosh ───
test('addProduct me emër bosh duhet të hedhë error', () => {
  const service = new ProductService(createMockRepo());
  expect(() => service.addProduct({
    name: '',
    sku: 'SKU-007',
    price: 10,
    quantity: 5
  })).toThrow('Emri i produktit është i detyrueshëm');
});

// ─── TESTI 3: addProduct — çmim i gabuar ───
test('addProduct me çmim 0 duhet të hedhë error', () => {
  const service = new ProductService(createMockRepo());
  expect(() => service.addProduct({
    name: 'Produkt Test',
    sku: 'SKU-008',
    price: 0,
    quantity: 5
  })).toThrow('numër valid për çmimin');
});

// ─── TESTI 4: getAllProducts — filter gjen produkt ───
test('getAllProducts me filter Laptop duhet të gjejë produkt', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  const result = service.getAllProducts('laptop');
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].name.toLowerCase()).toContain('laptop');
});

// ─── TESTI 5: getAllProducts — filter nuk gjen asgjë ───
test('getAllProducts me filter që nuk ekziston duhet të kthejë array bosh', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  const result = service.getAllProducts('xyz-nuk-ekziston-123');
  expect(result).toHaveLength(0);
});

// ─── TESTI 6: calculateAveragePrice ───
test('calculateAveragePrice duhet të kthejë mesataren e saktë', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  const avg = service.calculateAveragePrice();
  expect(avg).toBeGreaterThan(0);
  expect(typeof avg).toBe('number');
  // Mesatarja e 5 produkteve: (999.99+349.99+249.99+79.99+189.99)/5 = 373.99
  expect(avg).toBeCloseTo(373.99, 1);
});

// ─── TESTI 7: getMaxPriceProduct ───
test('getMaxPriceProduct duhet të kthejë produktin me çmimin më të lartë', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  const result = service.getMaxPriceProduct();
  expect(result).toBeDefined();
  expect(result.name).toBe('Laptop Dell XPS');
  expect(parseFloat(result.price)).toBe(999.99);
});

// ─── TESTI 8: getMinPriceProduct ───
test('getMinPriceProduct duhet të kthejë produktin me çmimin më të ulët', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  const result = service.getMinPriceProduct();
  expect(result).toBeDefined();
  expect(result.name).toBe('Tastiere Logitech');
  expect(parseFloat(result.price)).toBe(79.99);
});

// ─── TESTI 9: deleteProduct — ID ekziston ───
test('deleteProduct me ID valid duhet të fshijë produktin', () => {
  const mockRepo = createMockRepo(sampleProducts);
  const service = new ProductService(mockRepo);
  service.deleteProduct('1');
  expect(mockRepo.data.length).toBe(4);
});

// ─── TESTI 10: getProductById — ID nuk ekziston ───
test('getProductById me ID që nuk ekziston duhet të hedhë error', () => {
  const service = new ProductService(createMockRepo(sampleProducts));
  expect(() => service.getProductById('999')).toThrow('nuk u gjet');
});