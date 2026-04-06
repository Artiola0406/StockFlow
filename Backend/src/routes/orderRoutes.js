const express = require('express');
const router = express.Router();

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const OrderService = require('../services/OrderService');
  const OrderDbRepository = require('../repositories/OrderDbRepository');
  service = new OrderService(new OrderDbRepository());
  console.log('✅ Order routes: PostgreSQL');
} else {
  const OrderService = require('../services/OrderService');
  service = new OrderService();
  console.log('⚠️ Order routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const items = await service.getAllOrders();
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

router.get('/by-status/:status', async (req, res) => {
  try {
    const items = await service.getOrdersByStatus(req.params.status);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await service.getOrderById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await service.addOrder(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await service.updateOrder(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await service.deleteOrder(req.params.id);
    res.json({ success: true, message: 'Porosia u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;
