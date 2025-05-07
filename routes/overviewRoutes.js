const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  generateOverview,
  getOverview,
  updateOverview
} = require('../controllers/overviewController');

const Overview = require('../models/Overview');
const BusinessProfile = require('../models/BusinessProfile');

// ✅ Public route to get all overviews (for InvestorDashboard top business ranking)
router.get('/all', async (req, res) => {
  try {
    const overviews = await Overview.find({});
    res.json(overviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Secure admin route to get overviews with business names
router.get('/all-profiles', auth, async (req, res) => {
  try {
    // Optional admin check
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const overviews = await Overview.find({});
    const profiles = await BusinessProfile.find({});

    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user_id.toString()] = profile.business_name;
    });

    const merged = overviews.map(o => ({
      ...o.toObject(),
      business_name: profileMap[o.user_id.toString()] || ''
    }));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ NEW: Public ML-accessible route with secret key
router.get('/all-profiles-public', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ML_SECRET_KEY) {
      return res.status(403).json({ message: 'Unauthorized ML access' });
    }

    const overviews = await Overview.find({});
    const profiles = await BusinessProfile.find({});

    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user_id.toString()] = profile.business_name;
    });

    const merged = overviews.map(o => ({
      ...o.toObject(),
      business_name: profileMap[o.user_id.toString()] || ''
    }));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Public route to get overview + business_name without auth (for ML only)
router.get('/all-profiles-public', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ML_API_SECRET) {
      return res.status(401).json({ message: 'Unauthorized request' });
    }

    const overviews = await Overview.find({});
    const profiles = await BusinessProfile.find({});

    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user_id.toString()] = profile.business_name;
    });

    const merged = overviews.map(o => ({
      ...o.toObject(),
      business_name: profileMap[o.user_id.toString()] || ''
    }));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Authenticated routes for individual users
router.post('/generate', auth, generateOverview);
router.get('/', auth, getOverview);
router.put('/', auth, updateOverview);

module.exports = router;
