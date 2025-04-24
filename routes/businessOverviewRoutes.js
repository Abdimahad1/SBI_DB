const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getOverview, updateOverview } = require('../controllers/businessOverviewController');

router.get('/', auth, getOverview);
router.put('/', auth, updateOverview);

module.exports = router;
