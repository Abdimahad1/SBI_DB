const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { 
  saveInvestor, 
  getInvestors,
  deleteInvestor ,
  updateInvestorStatus
} = require('../controllers/interestedInvestorController');

router.post('/', auth, saveInvestor);
router.get('/', auth, getInvestors);
router.delete('/:id', auth, deleteInvestor);
router.patch('/:id', auth, updateInvestorStatus);


module.exports = router;