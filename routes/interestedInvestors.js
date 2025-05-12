const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { 
  saveInvestor, 
  getInvestors,
  deleteInvestor,
  getInvestorById
} = require('../controllers/interestedInvestorController');

router.post('/', auth, saveInvestor);
router.get('/', auth, getInvestors);
router.get('/:id', auth, getInvestorById);
router.delete('/:id', auth, deleteInvestor);

module.exports = router;
