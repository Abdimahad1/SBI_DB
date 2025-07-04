// routes/businessManagementRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkAdmin } = require('../middlewares/roleMiddleware');
const {
  getAllBusinesses,
  getBusinessStats,
  toggleBusinessStatus,
  toggleVerification
} = require('../controllers/businessManagementController');

// List all businesses
router.get('/all', auth, checkAdmin, getAllBusinesses);

// Get business stats
router.get('/stats', auth, checkAdmin, getBusinessStats);

// Toggle active/suspended status
router.patch('/:id/status', auth, checkAdmin, toggleBusinessStatus);

// Toggle verified/unverified status
router.patch('/:id/verification', auth, checkAdmin, toggleVerification);

module.exports = router;
