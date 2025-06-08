const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/businessProfileController');
const BusinessProfile = require('../models/BusinessProfile');

// Authenticated routes
router.get('/', auth, getProfile);
router.put('/', auth, upload.single('logo'), updateProfile);

// Public route to get a business profile by user_id
router.get('/public/:userId', async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user_id: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;