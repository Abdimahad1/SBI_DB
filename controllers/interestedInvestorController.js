const InterestedInvestor = require('../models/InterestedInvestor');

exports.saveInvestor = async (req, res) => {
  try {
    const { user_id, name, email, phone, message, image } = req.body;
    const business_owner_id = req.userId;

    if (!user_id) {
      return res.status(400).json({ message: 'Missing user_id in request' });
    }

    const newInvestor = await InterestedInvestor.create({
      business_owner_id,
      user_id, // ✅ Save this
      name,
      email,
      phone,
      message,
      image
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error('❌ Failed to save investor:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getInvestors = async (req, res) => {
  try {
    const investors = await InterestedInvestor.find({ business_owner_id: req.userId });
    res.json(investors);
  } catch (err) {
    console.error('❌ Failed to fetch investors:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add to interestedInvestorController.js
exports.deleteInvestor = async (req, res) => {
  try {
    const investor = await InterestedInvestor.findOneAndDelete({
      _id: req.params.id,
      business_owner_id: req.userId
    });
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    
    res.json({ message: 'Investor removed successfully' });
  } catch (err) {
    console.error('❌ Failed to delete investor:', err);
    res.status(500).json({ message: err.message });
  }
};

// In interestedInvestorController.js
exports.updateInvestorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const investor = await InterestedInvestor.findOneAndUpdate(
      { _id: req.params.id, business_owner_id: req.userId },
      { status },
      { new: true }
    );
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    
    res.json(investor);
  } catch (err) {
    console.error('❌ Failed to update investor:', err);
    res.status(500).json({ message: err.message });
  }
};