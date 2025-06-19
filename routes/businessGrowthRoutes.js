const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  saveMonthlyGrowth,
  getGrowthHistory,
  getGrowthPublic
} = require('../controllers/businessGrowthController');

router.post('/save', auth, saveMonthlyGrowth);
router.get('/', auth, getGrowthHistory);
router.get('/public', getGrowthPublic);

module.exports = router;
