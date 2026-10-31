const express = require('express');
const router = express.Router();
const catalogController = require('./catalog.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Catalog management is internal: admins configure it, staff consume it.
router.use(protect, authorize('admin', 'staff'));

// Products
router.post('/products', catalogController.createProduct);
router.get('/products', catalogController.getProducts);
router.patch('/products/:id', catalogController.updateProduct);

// Plans
router.post('/plans', catalogController.createPlan);
router.get('/plans', catalogController.getPlans);
router.patch('/plans/:id', catalogController.updatePlan);

// Quotation Templates
router.post('/templates', catalogController.createTemplate);
router.get('/templates', catalogController.getTemplates);

module.exports = router;