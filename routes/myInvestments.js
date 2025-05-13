const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createMyInvestment,
  getMyInvestments,
  updateStatusByInvestmentId,
  getInvestmentById
} = require('../controllers/myInvestmentController');
router.get('/by-investment', auth, getInvestmentById);

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

// GET specific investment by investment_id
router.get('/by-investment-id/:id', auth, async (req, res) => {
  try {
    const investment = await MyInvestment.findOne({ investment_id: req.params.id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json(investment);
  } catch (err) {
    console.error('Error fetching investment by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;