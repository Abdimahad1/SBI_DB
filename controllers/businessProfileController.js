const BusinessProfile = require('../models/BusinessProfile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ user_id: req.userId });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If an image file is uploaded, add it to the update
    if (req.file) {
      updateData.logo = req.file.filename;
    }

    const profile = await BusinessProfile.findOneAndUpdate(
      { user_id: req.userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
