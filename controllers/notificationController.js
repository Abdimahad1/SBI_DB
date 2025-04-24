const NotificationSetting = require('../models/NotificationSetting');

exports.getSettings = async (req, res) => {
  try {
    const settings = await NotificationSetting.findOne({ user_id: req.userId });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updated = await NotificationSetting.findOneAndUpdate(
      { user_id: req.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

