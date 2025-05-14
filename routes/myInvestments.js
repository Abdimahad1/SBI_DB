const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware'); // ✅ You exported default, so this is correct
const {
  createMyInvestment,
  getMyInvestments,
  updateStatusByInvestmentId,
  getInvestmentById
} = require('../controllers/myInvestmentController');

const MyInvestment = require('../models/MyInvestment'); // Needed for :id route

// Logging middleware (optional for debug)
router.use((req, res, next) => {
  console.log(`[MyInvestments] ${req.method} ${req.path}`);
  next();
});

// Create new investment (Investor -> Business)
router.post('/', auth, createMyInvestment);

// Get all investments for current investor
router.get('/', auth, getMyInvestments);

// Update investment status using investment_id
router.patch('/update-status', auth, updateStatusByInvestmentId);

// Get investment using ?investment_id=abc
router.get('/by-investment', auth, getInvestmentById);

// Get investment by path param :id
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

// Optional: test route
router.get('/test-connection', (req, res) => {
  res.json({
    success: true,
    message: 'MyInvestments route connected',
    available: [
      'POST /',
      'GET /',
      'GET /by-investment',
      'GET /by-investment-id/:id',
      'PATCH /update-status'
    ]
  });
});

module.exports = router;
