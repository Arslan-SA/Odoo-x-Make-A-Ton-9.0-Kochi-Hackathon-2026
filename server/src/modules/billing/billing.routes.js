const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');

// Rules (Taxes & Discounts)
router.post('/taxes', billingController.createTaxRule);
router.get('/taxes', billingController.getTaxRules);
router.post('/discounts', billingController.createDiscountRule);
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