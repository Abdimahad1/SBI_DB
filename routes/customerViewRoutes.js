const express = require('express');
const router = express.Router();
const { getCustomerProducts } = require('../controllers/customerViewController');
const User = require('../models/User'); // ✅ import User model

// ✅ Get products for customer view (no auth needed)
router.get('/products', getCustomerProducts);

// ✅ NEW: Fetch Business Owner Phone Number
router.get('/business-info', async (req, res) => {
  try {
    const { business } = req.query;
    if (!business) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    const user = await User.findById(business);
    if (!user) {
      return res.status(404).json({ message: 'Business owner not found' });
    }

    res.json({ phone: user.phone }); // ✅ Only return the phone number
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
