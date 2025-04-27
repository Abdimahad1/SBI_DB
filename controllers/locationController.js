const Location = require('../models/Location');

// CREATE
exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create({ ...req.body, user_id: req.userId });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL for user
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ user_id: req.userId });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateLocation = async (req, res) => {
  try {
    const updated = await Location.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Location not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteLocation = async (req, res) => {
  try {
    const deleted = await Location.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Location not found' });
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
