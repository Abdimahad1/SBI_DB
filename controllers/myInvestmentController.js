const MyInvestment = require('../models/MyInvestment');
const InterestedInvestor = require('../models/InterestedInvestor');
const Notification = require('../models/Notification');
const BusinessProfileForm = require('../models/BusinessProfileForm');
const Investment = require('../models/Investment');

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

    // ✅ Duplicate check
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
      totalRaised: 0,  // ✅ initial
      interestedCount: 0,
      investors: [],
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

    const previousStatus = investment.status;
    const currentContribution = investment.currentContribution || 0;
    const businessId = investment.businessId;

    // Update the investment status
    investment.status = status;
    await investment.save();

    // --- Update BusinessProfileForm.fundingTotalUSD ---
    const profile = await BusinessProfileForm.findOne({ user_id: businessId });

    if (profile) {
      let update = {};

      if (status === 'accepted' && previousStatus !== 'accepted') {
        update = { $inc: { fundingTotalUSD: currentContribution } };
        console.log(`✅ Added $${currentContribution} to fundingTotalUSD`);
      } else if (status === 'rejected' && previousStatus === 'accepted') {
        update = { $inc: { fundingTotalUSD: -currentContribution } };
        console.log(`✅ Subtracted $${currentContribution} from fundingTotalUSD`);
      }

      if (Object.keys(update).length > 0) {
        await BusinessProfileForm.updateOne(
          { user_id: businessId },
          update
        );
      }
    } else {
      console.warn('⚠️ Business profile not found for user_id:', businessId);
    }

    // --- Update Investment.currentContribution ---
    const parentInvestment = await Investment.findOne({ _id: investment_id });

    if (parentInvestment) {
      let invUpdate = {};

      if (status === 'accepted' && previousStatus !== 'accepted') {
        invUpdate = { $inc: { currentContribution: currentContribution } };
        console.log(`✅ Added $${currentContribution} to Investment.currentContribution`);
      } else if (status === 'rejected' && previousStatus === 'accepted') {
        invUpdate = { $inc: { currentContribution: -currentContribution } };
        console.log(`✅ Subtracted $${currentContribution} from Investment.currentContribution`);
      }

      if (Object.keys(invUpdate).length > 0) {
        await Investment.updateOne(
          { _id: investment_id },
          invUpdate
        );
      }
    } else {
      console.warn('⚠️ Investment not found for _id:', investment_id);
    }

    // --- Update MyInvestment progress ---
    if (status === 'accepted' && previousStatus !== 'accepted') {
      investment.totalRaised += currentContribution;
      investment.interestedCount += 1;
      investment.investors.push({
        investorId: investment.investorId,
        amount: currentContribution,
        date: new Date()
      });

      await investment.save();
      console.log(`✅ Updated MyInvestment progress`);
    }

    // --- Notify interested investors ---
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

// GET investment by query param ?investment_id=abc
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

    res.json([investment]); // Return as array for consistency
  } catch (err) {
    console.error('Get Investment Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Check if investment exists for current investor
exports.checkInvestmentExists = async (req, res) => {
  try {
    const investorId = req.userId;
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

// 🚀 GET /my-investments/track/:investment_id
exports.getInvestmentTrackData = async (req, res) => {
  try {
    const investment = await MyInvestment.findOne({
      investment_id: req.params.investment_id,
      investorId: req.userId // ✅ only your investment
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({
      goalAmount: investment.goalAmount,
      totalRaised: investment.totalRaised,
      percentFunded: Math.min(100, Math.round((investment.totalRaised / investment.goalAmount) * 100)),
      myContribution: investment.currentContribution,
      investors: investment.investors || [],
      interestedCount: investment.interestedCount
    });
  } catch (err) {
    console.error('Track Investment Error:', err);
    res.status(500).json({ message: err.message });
  }
};
