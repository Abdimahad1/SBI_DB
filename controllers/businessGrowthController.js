const BusinessGrowth = require('../models/BusinessGrowth');

exports.getGrowth = async (req, res) => {
  try {
    const data = await BusinessGrowth.find({ user_id: req.userId }).sort({ year: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addOrUpdateGrowth = async (req, res) => {
  try {
    const { year, percentage } = req.body;
    const updated = await BusinessGrowth.findOneAndUpdate(
      { user_id: req.userId, year },
      { $set: { percentage } },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
