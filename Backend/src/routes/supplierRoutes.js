const express = require('express');
const router = express.Router();

const useDatabase = process.env.DATABASE_URL ? true : false;

let service;
if (useDatabase) {
  const SupplierService = require('../services/SupplierService');
  const SupplierDbRepository = require('../repositories/SupplierDbRepository');
  service = new SupplierService(new SupplierDbRepository());
  console.log('✅ Supplier routes: PostgreSQL');
} else {
  const SupplierService = require('../services/SupplierService');
  service = new SupplierService();
  console.log('⚠️ Supplier routes: CSV');
}

router.get('/', async (req, res) => {
  try {
    const items = await service.getAllSuppliers(req.query.filter);
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

router.get('/active', async (req, res) => {
  try {
    const items = await service.getActiveSuppliers();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await service.getSupplierById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await service.addSupplier(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await service.updateSupplier(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await service.deleteSupplier(req.params.id);
    res.json({ success: true, message: 'Furnitori u fshi me sukses' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

module.exports = router;
