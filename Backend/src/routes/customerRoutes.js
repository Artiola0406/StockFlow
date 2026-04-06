const express = require('express');
const router = express.Router();

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const CustomerService = require('../services/CustomerService');
  const CustomerDbRepository = require('../repositories/CustomerDbRepository');
  service = new CustomerService(new CustomerDbRepository());
  console.log('✅ Customer routes: PostgreSQL');
} else {
  const CustomerService = require('../services/CustomerService');
  service = new CustomerService();
  console.log('⚠️ Customer routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const items = await service.getAllCustomers(req.query.filter);
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

router.get('/:id', async (req, res) => {
  try {
    const item = await service.getCustomerById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await service.addCustomer(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await service.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await service.deleteCustomer(req.params.id);
    res.json({ success: true, message: 'Klienti u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;
