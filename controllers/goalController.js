const Goal = require('../models/Goal');

// CREATE
exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user_id: req.userId });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL for user
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user_id: req.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateGoal = async (req, res) => {
  try {
    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
