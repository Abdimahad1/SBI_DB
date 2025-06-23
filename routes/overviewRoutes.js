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

// ✅ Public ML-accessible route — merged into 1 clean route
router.get('/all-profiles-public', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ML_SECRET_KEY && secret !== process.env.ML_API_SECRET) {
      return res.status(403).json({ message: 'Unauthorized ML access' });
    }

    const overviews = await Overview.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$user_id", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    const profiles = await BusinessProfile.find({});
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user_id.toString()] = profile.business_name;
    });

    const merged = overviews.map(o => ({
      ...o,
      business_name: profileMap[o.user_id.toString()] || ''
    }));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get overview for a specific businessId (user_id)
router.get('/public/:id', async (req, res) => {
  try {
    const overview = await Overview.findOne({ user_id: req.params.id });
    if (!overview) {
      return res.status(404).json({ message: 'Overview not found' });
    }
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Authenticated routes for individual users
router.post('/generate', auth, generateOverview);
router.get('/', auth, getOverview);
router.put('/', auth, updateOverview);

module.exports = router;
