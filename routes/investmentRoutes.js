const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getInvestments,
  getAllInvestments,
  updateInvestment,
  deleteInvestment,
  getInvestmentCount
} = require('../controllers/investmentController');

const authMiddleware = require('../middlewares/authMiddleware');

// Regular user routes
router.post('/', authMiddleware, createInvestment);
router.get('/', authMiddleware, getInvestments);
router.patch('/:id', authMiddleware, updateInvestment);
router.delete('/:id', authMiddleware, deleteInvestment);
router.get('/count', authMiddleware, getInvestmentCount);

// Investor-specific route
router.get('/all', authMiddleware, getAllInvestments);


module.exports = router;
