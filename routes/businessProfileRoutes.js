const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkBusinessOwner } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/businessProfileController');

// Authenticated routes - Business Owner only
router.get('/', auth, checkBusinessOwner, getProfile);
router.put('/', auth, checkBusinessOwner, upload.single('logo'), updateProfile);

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
