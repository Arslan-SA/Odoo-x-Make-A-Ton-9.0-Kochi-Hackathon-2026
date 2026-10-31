const express = require('express');
const router = express.Router();
const catalogController = require('./catalog.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Catalog is internal: admins configure it, staff consume read-only views.
router.use(protect, authorize('admin', 'staff'));

// Products — creation and updates are ADMIN-only per RBAC spec
router.get('/products', catalogController.getProducts);
router.post('/products', authorize('admin'), catalogController.createProduct);
router.patch('/products/:id', authorize('admin'), catalogController.updateProduct);

// Plans — creation and updates are ADMIN-only per RBAC spec
router.get('/plans', catalogController.getPlans);
router.post('/plans', authorize('admin'), catalogController.createPlan);
router.patch('/plans/:id', authorize('admin'), catalogController.updatePlan);

// Quotation Templates — creation is ADMIN-only per RBAC spec
router.get('/templates', catalogController.getTemplates);
router.post('/templates', authorize('admin'), catalogController.createTemplate);

module.exports = router;