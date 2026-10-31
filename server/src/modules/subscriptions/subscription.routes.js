const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Internal subscription operations. Customers use /api/portal instead.
router.use(protect, authorize('admin', 'staff'));

router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);
router.patch('/:id', subscriptionController.updateSubscription);
router.patch('/:id/status', subscriptionController.transitionStatus);
router.patch('/:id/lifecycle', subscriptionController.handleLifecycleAction);

module.exports = router;