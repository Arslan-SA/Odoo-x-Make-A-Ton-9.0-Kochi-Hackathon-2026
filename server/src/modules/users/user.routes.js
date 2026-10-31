const express = require('express');
const userController = require('./user.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Sales reps need a customer picker when creating subscriptions.
router.get('/customers', protect, authorize('admin', 'staff'), userController.listCustomers);

// Staff management is strictly an admin capability.
router.use(protect, authorize('admin'));

router.get('/staff', userController.listStaff);
router.post('/staff', userController.createStaff);
router.patch('/staff/:id/status', userController.updateStaffStatus);

module.exports = router;
