const MyInvestment = require('../models/MyInvestment');
const InterestedInvestor = require('../models/InterestedInvestor');
const Notification = require('../models/Notification');

// CREATE new investment
exports.createMyInvestment = async (req, res) => {
  try {
    const {
      businessId,
      investment_id,
      title,
      image,
      purpose,
      reason,
      goalAmount,
      currentContribution
    } = req.body;

    const investorId = req.userId;

    // ✅ Duplicate check here
    const exists = await MyInvestment.findOne({ investorId, investment_id });
    if (exists) {
      return res.status(409).json({ message: 'You already have this investment saved.' });
    }

    const newInvestment = await MyInvestment.create({
      investorId,
      businessId,
      investment_id,
      title,
      image,
      purpose,
      reason,
      goalAmount,
      currentContribution,
      status: 'pending'
    });

    res.status(201).json(newInvestment);
  } catch (err) {
    console.error('❌ Failed to create investment:', err);
    res.status(500).json({ message: err.message });
  }
};


// GET all investments for current investor
exports.getMyInvestments = async (req, res) => {
  try {
    const myInvestments = await MyInvestment.find({ investorId: req.userId });
    res.json(myInvestments);
  } catch (err) {
    console.error('❌ Get Investments Error:', err);
    res.status(500).json({ message: 'Failed to fetch investments', error: err.message });
  }
};

// PATCH: Update investment status using investment_id
// Update the updateStatusByInvestmentId function
exports.updateStatusByInvestmentId = async (req, res) => {
  const { investment_id, status } = req.body;

  if (!investment_id || !status) {
    return res.status(400).json({ message: 'Missing investment_id or status' });
  }

  try {
    const investment = await MyInvestment.findOne({ investment_id });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Update the investment status
    investment.status = status;
    await investment.save();

    // Notify interested investors
    const interestedInvestors = await InterestedInvestor.find({ investment_id });
    for (const investor of interestedInvestors) {
      await Notification.create({
        user_id: investor.user_id,
        title: 'Investment Status Update',
        message: `Your investment in "${investment.title}" has been ${status}.`,
      });
    }

    res.json({ success: true, investment });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// Add this to your existing exports
exports.getInvestmentById = async (req, res) => {
  try {
    const { investment_id } = req.query;
    if (!investment_id) {
      return res.status(400).json({ message: 'investment_id is required' });
    }

    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json([investment]); // Return as array for consistency with other endpoints
  } catch (err) {
    console.error('Get Investment Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.checkInvestmentExists = async (req, res) => {
  try {
    const investorId = req.userId; // from auth middleware
    const { investment_id } = req.query;

    if (!investment_id) {
      return res.status(400).json({ message: 'investment_id is required' });
    }

    const exists = await MyInvestment.findOne({ investorId, investment_id });

    res.json({ exists: !!exists });
  } catch (err) {
    console.error('Check investment exists error:', err);
    res.status(500).json({ message: 'Failed to check investment existence' });
  }
};