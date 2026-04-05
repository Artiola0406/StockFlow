const express = require('express');
const router = express.Router();
const WarehouseService = require('../services/WarehouseService');

const service = new WarehouseService();

// GET /api/warehouses?filter=
router.get('/', (req, res) => {
  try {
    const warehouses = service.getAllWarehouses(req.query.filter);
    res.json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/warehouses/stats
router.get('/stats', (req, res) => {
  try {
    const stats = service.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/warehouses/:id
router.get('/:id', (req, res) => {
  try {
    const warehouse = service.getWarehouseById(req.params.id);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/warehouses
router.post('/', (req, res) => {
  try {
    const warehouse = service.addWarehouse(req.body);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/warehouses/:id
router.put('/:id', (req, res) => {
  try {
    const warehouse = service.updateWarehouse(req.params.id, req.body);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/warehouses/:id
router.delete('/:id', (req, res) => {
  try {
    service.deleteWarehouse(req.params.id);
    res.json({ success: true, message: 'Depoja u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;