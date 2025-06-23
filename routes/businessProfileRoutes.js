const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkBusinessOwner } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/businessProfileController');

const BusinessProfile = require('../models/BusinessProfile'); // you missed this in your route file

// ✅ Authenticated routes - Business Owner only
router.get('/', auth, checkBusinessOwner, getProfile);
router.put('/', auth, checkBusinessOwner, upload.single('logo'), updateProfile);

// ✅ Public route to get a business profile by user_id (safe ObjectId conversion)
router.get('/public/:userId', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const profile = await BusinessProfile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error in GET /profile/public/:userId:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
