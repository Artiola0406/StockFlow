const express = require('express');
const router = express.Router();

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const ProductService = require('../services/ProductService');
  const ProductDbRepository = require('../repositories/ProductDbRepository');
  service = new ProductService(new ProductDbRepository());
  console.log('✅ Products: duke përdorur PostgreSQL');
} else {
  const ProductService = require('../services/ProductService');
  service = new ProductService();
  console.log('⚠️ Products: duke përdorur CSV (pa DATABASE_URL)');
}

router.get('/', async (req, res) => {
  try {
    const { filter, sortBy, sortOrder } = req.query;
    const products = await service.getAllProducts(filter, sortBy, sortOrder);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await service.calculateStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await service.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await service.addProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await service.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Produkti u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;