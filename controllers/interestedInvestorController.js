const InterestedInvestor = require('../models/InterestedInvestor');

// CREATE
exports.saveInvestor = async (req, res) => {
  try {
    const { investment_id, name, email, message, image } = req.body;
    const user_id = req.userId; // From auth middleware

    // Validate required fields
    if (!investment_id) {
      return res.status(400).json({
        message: 'Missing required field: investment_id',
        required: ['investment_id'],
        received: { investment_id }
      });
    }

    const newInvestor = await InterestedInvestor.create({
      user_id,
      investment_id,
      name,
      email,
      message,
      image,
      status: 'pending'
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error('Failed to save investor:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET all investors (returns all entries for now, you can add filtering later)
exports.getInvestors = async (req, res) => {
  try {
    const investors = await InterestedInvestor.find(); // No business_owner_id filter
    res.json(investors);
  } catch (err) {
    console.error('❌ Failed to fetch investors:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE investor by ID
exports.deleteInvestor = async (req, res) => {
  try {
    const investor = await InterestedInvestor.findOneAndDelete({
      _id: req.params.id
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

// UPDATE investor status
exports.updateInvestorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const investor = await InterestedInvestor.findOneAndUpdate(
      { _id: req.params.id },
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
