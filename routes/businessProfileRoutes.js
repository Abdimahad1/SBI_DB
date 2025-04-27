const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { getProfile, updateProfile } = require('../controllers/businessProfileController');

router.get('/', auth, getProfile);
router.put('/', auth, upload.single('logo'), updateProfile);

module.exports = router;
