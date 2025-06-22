const InvestorProfile = require('../models/InvestorProfile');

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

exports.updateProfile = async (req, res) => {
  try {
    const updateData = { 
      business_name: req.body.business_name,
      location: req.body.location,
      business_email: req.body.business_email
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