const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createMyInvestment,
  getMyInvestments,
  updateStatusByInvestmentId
} = require('../controllers/myInvestmentController');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`MyInvestments route accessed: ${req.method} ${req.path}`);
  next();
});

// Create investment
router.post('/', auth, createMyInvestment);

// Get investments for investor
router.get('/', auth, getMyInvestments);

// Update investment status
router.patch('/update-status', auth, (req, res, next) => {
  console.log('Update status route hit', req.body);
  next();
}, updateStatusByInvestmentId);

// Test route for debugging
router.get('/test-connection', (req, res) => {
  res.json({ 
    success: true,
    message: "My Investments route is connected",
    availableEndpoints: [
      'POST /',
      'GET /',
      'PATCH /update-status'
    ]
  });
});

module.exports = router;