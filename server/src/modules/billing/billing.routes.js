const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Finance operations are internal; customers see their own invoices via /api/portal.
router.use(protect, authorize('admin', 'staff'));

// Rules (Taxes & Discounts) — only admins can change workspace settings.
router.post('/taxes', authorize('admin'), billingController.createTaxRule);
router.get('/taxes', billingController.getTaxRules);
router.post('/discounts', authorize('admin'), billingController.createDiscountRule);
router.get('/discounts', billingController.getDiscountRules);

// Automated Billing Engine Trigger
router.post('/run', billingController.runBillingEngine);

// Invoices
router.get('/invoices', billingController.getInvoices);
router.get('/invoices/:id', billingController.getInvoiceById);
router.patch('/invoices/:id/status', billingController.updateInvoiceStatus);

// Payments
router.post('/payments', billingController.recordPayment);
router.get('/payments', billingController.getPayments);

// Finance Lead Analytics Dashboard (<2s SLA)
router.get('/dashboard', billingController.getFinanceDashboard);

module.exports = router;