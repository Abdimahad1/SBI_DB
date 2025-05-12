const Investment = require('../models/Investment');

// CREATE
exports.createInvestment = async (req, res) => {
  try {
    const investmentData = { ...req.body };

    // Automatically assign user_id if not included
    if (!investmentData.user_id) {
      investmentData.user_id = req.userId;
    }

    // ✅ Default to true only if explicitly marked
    if (typeof investmentData.isInvestorInitiated === 'undefined') {
      investmentData.isInvestorInitiated = false;
    }

    const investment = await Investment.create(investmentData);
    res.status(201).json(investment);
  } catch (err) {
    console.error('❌ Investment creation failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET ALL for business owner
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user_id: req.userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL visible to public (FindInvestments)
exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ isInvestorInitiated: { $ne: true } }) // exclude investor-created
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });

    const investmentsWithMeta = investments.map(investment => ({
      ...investment._doc,
      progress: (investment.currentContribution / investment.goalAmount) * 100
    }));

    res.json(investmentsWithMeta);
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


exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json(investment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
