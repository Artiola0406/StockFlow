const express = require('express');
const router = express.Router();
const ProductService = require('../services/ProductService');

const service = new ProductService();

// GET /api/products?filter=&sortBy=&sortOrder=
router.get('/', (req, res) => {
  try {
    const { filter, sortBy, sortOrder } = req.query;
    const products = service.getAllProducts(filter, sortBy, sortOrder);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/stats
router.get('/stats', (req, res) => {
  try {
    const stats = service.calculateStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = service.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const product = service.addProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  try {
    const product = service.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  try {
    service.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Produkti u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;