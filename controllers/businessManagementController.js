// controllers/businessManagementController.js
const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');

/**
 * Get all businesses for admin
 */
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await BusinessProfile.find().populate('user_id', 'name email status');
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get business stats for admin
 */
exports.getBusinessStats = async (req, res) => {
  try {
    const total = await BusinessProfile.countDocuments();
    const active = await BusinessProfile.countDocuments({ status: 'active' });
    const suspended = await BusinessProfile.countDocuments({ status: 'suspended' });

    // simulate growth numbers for now
    const businessGrowth = 8.2; // you could calculate dynamically later
    const verificationGrowth = 15.7;

    res.json({
      totalBusinesses: total,
      activeBusinesses: active,
      suspendedBusinesses: suspended,
      businessGrowth,
      verificationGrowth
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Toggle active/suspended status of a business
 */
exports.toggleBusinessStatus = async (req, res) => {
  try {
    const businessId = req.params.id;

    const business = await BusinessProfile.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const newStatus = business.status === 'active' ? 'suspended' : 'active';
    business.status = newStatus;
    await business.save();

    res.json({ message: `Business status updated to ${newStatus}`, business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Toggle verified/unverified status of a business
 */
exports.toggleVerification = async (req, res) => {
  try {
    const businessId = req.params.id;

    const business = await BusinessProfile.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.verified = !business.verified;
    await business.save();

    res.json({ message: `Business verification set to ${business.verified}`, business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
