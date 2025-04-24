const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getGrowth, addOrUpdateGrowth } = require('../controllers/businessGrowthController');

router.get('/', auth, getGrowth);
router.put('/', auth, addOrUpdateGrowth);

module.exports = router;
