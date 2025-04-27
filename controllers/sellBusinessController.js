const SellBusiness = require('../models/SellBusiness');

// CREATE
exports.createBusiness = async (req, res) => {
  try {
    const listing = await SellBusiness.create({ ...req.body, user_id: req.userId });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ
exports.getBusinesses = async (req, res) => {
  try {
    const listings = await SellBusiness.find({ user_id: req.userId });
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateBusiness = async (req, res) => {
  try {
    const updated = await SellBusiness.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Listing not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteBusiness = async (req, res) => {
  try {
    const deleted = await SellBusiness.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
