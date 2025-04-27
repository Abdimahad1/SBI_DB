const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  generateOverview,
  getOverview,
  updateOverview
} = require('../controllers/overviewController');

// Auto-generate expenses, income, products_sold
router.post('/generate', auth, generateOverview);

// Get current Overview
router.get('/', auth, getOverview);

// Update locations or score_level manually
router.put('/', auth, updateOverview);

module.exports = router;
