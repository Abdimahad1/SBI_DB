const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkInvestor } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/investorProfileController');

// Authenticated routes - Investor only
router.get('/', auth, checkInvestor, getProfile);
router.put('/', auth, checkInvestor, upload.single('logo'), updateProfile);

// Public route to get an investor profile by user_id
router.get('/public/:userId', async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ user_id: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Investor profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;