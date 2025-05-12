const InterestedInvestor = require('../models/InterestedInvestor');

// CREATE
exports.saveInvestor = async (req, res) => {
  try {
    const { investment_id, name, email, message, image } = req.body;
    const user_id = req.userId;

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
      image
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error('Failed to save investor:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET all investors
exports.getInvestors = async (req, res) => {
  try {
    const investors = await InterestedInvestor.find();
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

// GET investor by ID
exports.getInvestorById = async (req, res) => {
  try {
    const investor = await InterestedInvestor.findById(req.params.id);
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    res.json(investor);
  } catch (err) {
    console.error('❌ Failed to fetch investor:', err);
    res.status(500).json({ message: err.message });
  }
};
