const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/NotificationSettingsController');

// Settings Routes
router.get('/', auth, getSettings);        // Get settings
router.put('/', auth, updateSettings);      // Update settings

module.exports = router;
