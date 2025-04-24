const BusinessOverview = require('../models/BusinessOverview');

exports.getOverview = async (req, res) => {
  try {
    const overview = await BusinessOverview.findOne({ user_id: req.userId });
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOverview = async (req, res) => {
  try {
    const updated = await BusinessOverview.findOneAndUpdate(
      { user_id: req.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
