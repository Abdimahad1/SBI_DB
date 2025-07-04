const Investment = require('../models/Investment');

// CREATE investment (auto-generated _id by MongoDB)
exports.createInvestment = async (req, res) => {
  try {
    const investmentData = { ...req.body };

    // Automatically assign user_id if not provided
    if (!investmentData.user_id) {
      investmentData.user_id = req.userId;
    }

    // Default investorInitiated to false if undefined
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

// GET investments for current business owner
exports.getInvestments = async (req, res) => {
  try {
    console.log('Fetching investments for user:', req.userId);
    const investments = await Investment.find({ user_id: req.userId });
    console.log('Found investments:', investments);
    res.json(investments);
  } catch (err) {
    console.error('❌ Failed to fetch investments:', {
      message: err.message,
      stack: err.stack,
      userIdUsed: req.userId
    });
    res.status(500).json({ message: err.message });
  }
};

// GET all public investments (used in investor view)
exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ isInvestorInitiated: { $ne: true } })
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });

    const investmentsWithMeta = investments.map(investment => ({
      ...investment._doc,
      progress: (investment.currentContribution / investment.goalAmount) * 100
    }));

    res.json(investmentsWithMeta);
  } catch (err) {
    console.error('❌ Failed to load public investments:', err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE investment
exports.updateInvestment = async (req, res) => {
  try {
    const updated = await Investment.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('❌ Investment update failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE investment
exports.deleteInvestment = async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json({ message: 'Investment deleted successfully' });
  } catch (err) {
    console.error('❌ Investment deletion failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET investment by ID
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json(investment);
  } catch (err) {
    console.error('❌ Failed to get investment by ID:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getInvestmentCount = async (req, res) => {
  try {
    const count = await Investment.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET investment statistics for admin dashboard
exports.getInvestmentStats = async (req, res) => {
  try {
    const total = await Investment.countDocuments();

    // You might have a `status` field in MyInvestment, but since
    // your Investment model does not yet have a `status`,
    // we will assume all are “pending” if you wish, or
    // you can later integrate MyInvestment counts.

    // for now:
    const pending = 0;
    const approved = 0;
    const rejected = 0;

    // if you want to integrate MyInvestment statuses, you can do:
    const MyInvestment = require('../models/MyInvestment');

    const pendingMy = await MyInvestment.countDocuments({ status: 'pending' });
    const approvedMy = await MyInvestment.countDocuments({ status: 'accepted' });
    const rejectedMy = await MyInvestment.countDocuments({ status: 'rejected' });

    // simplified “investment growth” example
    const investmentGrowth = 12.5; // static for now
    const approvalGrowth = 8.3;     // static for now

    res.json({
      totalInvestments: total,
      pendingInvestments: pendingMy,
      approvedInvestments: approvedMy,
      rejectedInvestments: rejectedMy,
      investmentGrowth,
      approvalGrowth
    });
  } catch (err) {
    console.error("❌ Failed to get investment stats:", err.message);
    res.status(500).json({ message: "Failed to get stats", error: err.message });
  }
};

