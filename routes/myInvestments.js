// routes/myInvestments.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createMyInvestment,
  getMyInvestments
} = require('../controllers/myInvestmentController');

router.post('/', auth, createMyInvestment);
router.get('/', auth, getMyInvestments);

module.exports = router;
