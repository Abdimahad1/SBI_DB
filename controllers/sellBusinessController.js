const SellBusiness = require('../models/SellBusiness');

// CREATE - Only by the authenticated user (seller)
exports.createBusiness = async (req, res) => {
  try {
    const listing = await SellBusiness.create({ ...req.body, user_id: req.userId });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ - Only listings created by the logged-in user (seller view)
exports.getBusinesses = async (req, res) => {
  try {
    const listings = await SellBusiness.find({ user_id: req.userId });
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL - For investor view (with logo lookup from BusinessProfile)
exports.getAllBusinesses = async (req, res) => {
  try {
    const listings = await SellBusiness.aggregate([
      {
        $lookup: {
          from: 'businessprofiles', // Ensure this matches the actual MongoDB collection name
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'profile'
        }
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          business: 1,
          industry: 1,
          price: 1,
          reason: 1,
          contact: 1,
          user_id: 1,
          logo: '$profile.logo'
        }
      }
    ]);

    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE - Only by the owner (seller)
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

// DELETE - Only by the owner (seller)
exports.deleteBusiness = async (req, res) => {
  try {
    const deleted = await SellBusiness.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
