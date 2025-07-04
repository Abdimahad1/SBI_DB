const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

const {
  createMyInvestment,
  getMyInvestments,
  getAllMyInvestments,           // NEW controller to list all investments for admin
  updateStatusByInvestmentId,
  getInvestmentById,
  getInvestmentTrackData
} = require('../controllers/myInvestmentController');

const MyInvestment = require('../models/MyInvestment');

// ✅ Logging for debug
router.use((req, res, next) => {
  console.log(`[MyInvestments] ${req.method} ${req.path}`);
  next();
});

// CREATE new investment (investor to business)
router.post('/', auth, createMyInvestment);

// GET all investments for current investor
router.get('/', auth, getMyInvestments);

// ✅ NEW: GET all investments for admin/dashboard table
router.get('/all', auth, getAllMyInvestments);

// GET investment details by investment_id query param
router.get('/by-investment', auth, getInvestmentById);

// PATCH update status (accepted/rejected)
router.patch('/update-status', auth, updateStatusByInvestmentId);

// GET track data (for progress bars)
router.get('/track/:investment_id', auth, getInvestmentTrackData);

// GET by path param (legacy fallback)
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

// Test connection
router.get('/test-connection', (req, res) => {
  res.json({
    success: true,
    message: 'MyInvestments route connected',
    available: [
      'POST /',
      'GET /',
      'GET /all',                   // added new
      'GET /by-investment',
      'PATCH /update-status',
      'GET /track/:investment_id',
      'GET /by-investment-id/:id'
    ]
  });
});

module.exports = router;
