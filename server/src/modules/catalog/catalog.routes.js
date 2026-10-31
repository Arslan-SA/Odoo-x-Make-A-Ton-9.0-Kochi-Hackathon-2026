const express = require('express');
const router = express.Router();
const catalogController = require('./catalog.controller');

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