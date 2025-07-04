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
      totalRaised: 0,
      interestedCount: 0,
      investors: [],
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newInvestment });
  } catch (err) {
    console.error('❌ Failed to create investment:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all investments for current investor
exports.getMyInvestments = async (req, res) => {
  try {
    const myInvestments = await MyInvestment.find({ investorId: req.userId });
    res.json({ success: true, data: myInvestments });
  } catch (err) {
    console.error('❌ Get Investments Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch investments', error: err.message });
  }
};

// PATCH: update investment status
exports.updateStatusByInvestmentId = async (req, res) => {
  const { investment_id, status } = req.body;

  if (!investment_id || !status) {
    return res.status(400).json({ success: false, message: "Missing investment_id or status" });
  }

  try {
    console.log(`🔵 Status change received: investment_id=${investment_id}, status=${status}`);

    // 1️⃣ Get the MyInvestment record
    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      console.warn(`❌ MyInvestment not found for investment_id=${investment_id}`);
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    const previousStatus = investment.status;
    const currentContribution = investment.currentContribution || 0;
    const businessId = investment.businessId;

    console.log(`🔵 Found MyInvestment with previousStatus=${previousStatus}, currentContribution=${currentContribution}`);

    investment.status = status;
    await investment.save();

    // 2️⃣ Get the BusinessProfileForm
    const profile = await BusinessProfileForm.findOne({ user_id: businessId });
    if (!profile) {
      console.warn(`⚠️ BusinessProfileForm not found for user_id=${businessId}`);
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }

    // 3️⃣ Decide which funding field to increment
    const fundingSequence = [
      "seedFunding", "angelFunding", "ventureFunding", "convertibleNote",
      "equityCrowdfunding", "debtFinancing", "privateEquity", "postIpoEquity"
    ];

    const currentRoundIndex = profile.fundingRounds || 0;
    const fundingTypeField = fundingSequence[
      Math.min(currentRoundIndex, fundingSequence.length - 1)
    ] || "seedFunding";

    console.log(`✅ fundingTypeField selected: ${fundingTypeField}`);

    // 4️⃣ Build the increment update
    const update = {};

    if (status === "accepted" && previousStatus !== "accepted") {
      update.$inc = {
        fundingTotalUSD: currentContribution,
        [fundingTypeField]: currentContribution
      };

      // fundingRounds check
      const parentInvestment = await Investment.findOne({ _id: investment_id });
      if (parentInvestment) {
        const totalRaisedAfter = (parentInvestment.currentContribution || 0) + currentContribution;
        if (totalRaisedAfter >= parentInvestment.goalAmount) {
          update.$inc.fundingRounds = 1;
          console.log(`✅ fundingRounds increment triggered to ${profile.fundingRounds + 1}`);
        }
      }
    }
    else if (status === "rejected" && previousStatus === "accepted") {
      // rollback
      const investorEntry = investment.investors.find(
        inv => inv.investorId.toString() === investment.investorId.toString()
      );
      update.$inc = {
        fundingTotalUSD: -currentContribution,
      };
      if (investorEntry && investorEntry.fundingType) {
        update.$inc[investorEntry.fundingType] = -currentContribution;
      }
      console.log(`✅ Rollback applied:`, update.$inc);
    }

    // 5️⃣ Actually apply update to the BusinessProfileForm
    if (Object.keys(update).length > 0) {
      console.log(`🔵 Applying BusinessProfileForm update:`, update.$inc);

      const updatedProfile = await BusinessProfileForm.findOneAndUpdate(
        { user_id: businessId },
        update,
        { new: true }
      );

      if (updatedProfile) {
        console.log(`✅ Profile updated:
          fundingTotalUSD=${updatedProfile.fundingTotalUSD}
          fundingRounds=${updatedProfile.fundingRounds}
          ${fundingTypeField}=${updatedProfile[fundingTypeField]}
        `);
      } else {
        console.warn(`⚠️ BusinessProfileForm update returned null`);
      }
    }

    // 6️⃣ Also update Investment doc itself
    const parentInvestment = await Investment.findOne({ _id: investment_id });
    if (parentInvestment) {
      const invUpdate = {};
      if (status === "accepted" && previousStatus !== "accepted") {
        invUpdate.$inc = { currentContribution: currentContribution };
      } else if (status === "rejected" && previousStatus === "accepted") {
        invUpdate.$inc = { currentContribution: -currentContribution };
      }
      if (Object.keys(invUpdate).length > 0) {
        console.log(`🔵 Applying Investment doc update:`, invUpdate.$inc);
        await Investment.updateOne({ _id: investment_id }, invUpdate);
      }
    }

    // 7️⃣ push to MyInvestment investors array
    if (status === "accepted" && previousStatus !== "accepted") {
      investment.totalRaised += currentContribution;
      investment.interestedCount += 1;
      investment.investors.push({
        investorId: investment.investorId,
        amount: currentContribution,
        date: new Date(),
        fundingType: fundingTypeField
      });
      await investment.save();
      console.log(`✅ MyInvestment investors array updated with fundingType=${fundingTypeField}`);
    }

    // 8️⃣ send notifications
    const interestedInvestors = await InterestedInvestor.find({ investment_id });
    for (const investor of interestedInvestors) {
      await Notification.create({
        user_id: investor.user_id,
        title: "Investment Status Update",
        message: `Your investment in "${investment.title}" has been ${status}.`
      });
    }

    // 9️⃣ respond
    res.json({
      success: true,
      data: investment
    });

  } catch (err) {
    console.error(`❌ updateStatusByInvestmentId error:`, err.message, err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to update investment status",
      error: err.message
    });
  }
};


// GET investment by query param
exports.getInvestmentById = async (req, res) => {
  try {
    const { investment_id } = req.query;
    if (!investment_id) {
      return res.status(400).json({ success: false, message: 'investment_id is required' });
    }

    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    res.json({ success: true, data: investment });
  } catch (err) {
    console.error('Get Investment Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

// check if investment exists
exports.checkInvestmentExists = async (req, res) => {
  try {
    const investorId = req.userId;
    const { investment_id } = req.query;

    if (!investment_id) {
      return res.status(400).json({ success: false, message: 'investment_id is required' });
    }

    const exists = await MyInvestment.findOne({ investorId, investment_id });
    res.json({ success: true, exists: !!exists });
  } catch (err) {
    console.error('Check investment exists error:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Failed to check investment existence' });
  }
};

// get track data
exports.getInvestmentTrackData = async (req, res) => {
  try {
    const investment = await MyInvestment.findOne({
      investment_id: req.params.investment_id,
      investorId: req.userId
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    res.json({
      success: true,
      data: {
        goalAmount: investment.goalAmount,
        totalRaised: investment.totalRaised,
        percentFunded: Math.min(100, Math.round((investment.totalRaised / investment.goalAmount) * 100)),
        myContribution: investment.currentContribution,
        investors: investment.investors || [],
        interestedCount: investment.interestedCount
      }
    });
  } catch (err) {
    console.error('Track Investment Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all MyInvestments for admin to monitor
exports.getAllMyInvestments = async (req, res) => {
  try {
    const investments = await MyInvestment.find()
      .populate("investorId", "name email")  // get investor name
      .populate("businessId", "name email")  // get business name
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (err) {
    console.error("Failed to get all myinvestments:", err);
    res.status(500).json({ message: err.message });
  }
};

