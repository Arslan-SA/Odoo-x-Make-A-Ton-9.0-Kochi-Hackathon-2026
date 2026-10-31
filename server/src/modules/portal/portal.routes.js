const express = require('express');
const portalController = require('./portal.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Customer self-service only. The controller scopes every query to req.user._id.
router.use(protect, authorize('customer'));

router.get('/overview', portalController.getOverview);
router.patch('/subscriptions/:id/lifecycle', portalController.handleLifecycleAction);

module.exports = router;
