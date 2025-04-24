const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/notificationController');

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);

module.exports = router;
