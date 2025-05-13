const express = require('express');
const router = express.Router();
const { 
  createInterestedInvestor, 
  getInterestedInvestors, 
  deleteInterestedInvestor,
  updateInvestorStatus // Make sure this is imported
} = require('../controllers/interestedInvestorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Add this route for status updates
router.patch('/update-status', authMiddleware, updateInvestorStatus);

// Your other routes...
router.post('/', authMiddleware, createInterestedInvestor);
router.get('/', authMiddleware, getInterestedInvestors);
router.delete('/:id', authMiddleware, deleteInterestedInvestor);

module.exports = router;