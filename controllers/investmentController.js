const Investment = require('../models/Investment');

// CREATE
exports.createInvestment = async (req, res) => {
  try {
    const investment = await Investment.create({ ...req.body, user_id: req.userId });
    res.status(201).json(investment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL for user
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user_id: req.userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateInvestment = async (req, res) => {
  try {
    const updated = await Investment.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Investment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteInvestment = async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Investment not found' });
    res.json({ message: 'Investment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
