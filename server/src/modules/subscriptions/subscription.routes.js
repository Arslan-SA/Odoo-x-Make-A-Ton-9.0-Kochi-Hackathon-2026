const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');

router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);
router.patch('/:id/status', subscriptionController.transitionStatus);
router.patch('/:id/lifecycle', subscriptionController.handleLifecycleAction);

module.exports = router;