const express = require('express');
const router = express.Router();

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const StockMovementService = require('../services/StockMovementService');
  const StockMovementDbRepository = require('../repositories/StockMovementDbRepository');
  service = new StockMovementService(new StockMovementDbRepository());
  console.log('✅ Stock movement routes: PostgreSQL');
} else {
  const StockMovementService = require('../services/StockMovementService');
  service = new StockMovementService();
  console.log('⚠️ Stock movement routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const items = await service.getAllMovements();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await service.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/by-type/:type', async (req, res) => {
  try {
    const items = await service.getMovementsByType(req.params.type.toUpperCase());
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await service.getMovementById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await service.addMovement(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await service.updateMovement(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await service.deleteMovement(req.params.id);
    res.json({ success: true, message: 'Lëvizja u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;
