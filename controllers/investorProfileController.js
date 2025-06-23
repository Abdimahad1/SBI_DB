const InvestorProfile = require('../models/InvestorProfile');

// ✅ GET Investor Profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ user_id: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Investor profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE Investor Profile
exports.updateProfile = async (req, res) => {
  try {
    const updateData = { 
      investor_name: req.body.investor_name,
      investor_location: req.body.investor_location,
      investor_email: req.body.investor_email,
      investor_website: req.body.investor_website || ''
    };

    if (req.file) {
      updateData.logo = req.file.filename;
    }

    const profile = await InvestorProfile.findOneAndUpdate(
      { user_id: req.userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
