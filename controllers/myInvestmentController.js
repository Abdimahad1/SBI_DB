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

// UPDATE business profile funding information
exports.updateBusinessFunding = async (req, res) => {
  try {
    const { user_id } = req.user;
    const fundingData = req.body;

    // List of all funding fields
    const fundingFields = [
      'seedFunding', 'ventureFunding', 'angelFunding', 'debtFinancing',
      'convertibleNote', 'equityCrowdfunding', 'privateEquity', 'postIpoEquity'
    ];

    // Prepare update object
    const update = {};
    let totalFunding = 0;
    let fundingRounds = 0;

    // Process each funding field
    fundingFields.forEach(field => {
      if (fundingData[field] !== undefined) {
        const value = parseFloat(fundingData[field]) || 0;
        update[field] = value;
        totalFunding += value;
        fundingRounds++;
      }
    });

    // Add calculated fields
    update.fundingTotalUSD = totalFunding;
    update.fundingRounds = fundingRounds;

    // Update current funding round if specified
    if (fundingData.currentFundingRound) {
      update.currentFundingRound = fundingData.currentFundingRound;
    }

    // If we have total funding but no breakdown, assign to currentFundingRound
    if (totalFunding > 0 && fundingRounds === 0) {
      const currentRound = fundingData.currentFundingRound || 'seedFunding';
      update[currentRound] = totalFunding;
      fundingRounds = 1;
      update.fundingRounds = fundingRounds;
    }

    const updatedProfile = await BusinessProfileForm.findOneAndUpdate(
      { user_id },
      { $set: update },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('❌ Update business funding error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update business funding',
      error: error.message
    });
  }
};

// PATCH: update investment status with enhanced funding handling
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

    // 3️⃣ Determine funding field based on currentFundingRound or find next empty
    let fundingTypeField = profile.currentFundingRound || "seedFunding";
    const fundingSequence = [
      "seedFunding", "angelFunding", "ventureFunding", "convertibleNote",
      "equityCrowdfunding", "debtFinancing", "privateEquity", "postIpoEquity"
    ];

    // If no currentFundingRound set, find the first empty field
    if (!profile.currentFundingRound) {
      for (const field of fundingSequence) {
        if (!profile[field] || parseFloat(profile[field]) === 0) {
          fundingTypeField = field;
          break;
        }
      }
    }

    console.log(`✅ Selected funding field: ${fundingTypeField}`);

    // 4️⃣ Build the increment update
    const update = { $set: {} };
    const inc = {};

    if (status === "accepted" && previousStatus !== "accepted") {
      inc.fundingTotalUSD = currentContribution;
      inc[fundingTypeField] = currentContribution;

      // Check if this completes the current funding round
      const parentInvestment = await Investment.findOne({ _id: investment_id });
      if (parentInvestment) {
        const totalRaisedAfter = (parentInvestment.currentContribution || 0) + currentContribution;
        
        // Only increment fundingRounds if goal is met and we're not already in a new round
        if (totalRaisedAfter >= parentInvestment.goalAmount && 
            fundingTypeField === profile.currentFundingRound) {
          inc.fundingRounds = 1;
          
          // Move to next funding round
          const currentIndex = fundingSequence.indexOf(fundingTypeField);
          if (currentIndex < fundingSequence.length - 1) {
            update.$set.currentFundingRound = fundingSequence[currentIndex + 1];
          }
          console.log(`✅ fundingRounds increment triggered to ${profile.fundingRounds + 1}`);
        }
      }
      
      if (Object.keys(inc).length > 0) {
        update.$inc = inc;
      }
    }
    else if (status === "rejected" && previousStatus === "accepted") {
      // rollback - find which funding type was used for this investment
      const investorEntry = investment.investors.find(
        inv => inv.investorId.toString() === investment.investorId.toString()
      );
      
      const rollbackInc = {
        fundingTotalUSD: -currentContribution,
      };
      
      if (investorEntry && investorEntry.fundingType) {
        rollbackInc[investorEntry.fundingType] = -currentContribution;
      }
      update.$inc = rollbackInc;
      console.log(`✅ Rollback applied:`, update.$inc);
    }

    // 5️⃣ Apply update to the BusinessProfileForm
    if (Object.keys(update.$set).length > 0 || Object.keys(update.$inc || {}).length > 0) {
      console.log(`🔵 Applying BusinessProfileForm update:`, update);

      const updatedProfile = await BusinessProfileForm.findOneAndUpdate(
        { user_id: businessId },
        update,
        { new: true }
      );

      if (updatedProfile) {
        console.log(`✅ Profile updated:
          fundingTotalUSD=${updatedProfile.fundingTotalUSD}
          fundingRounds=${updatedProfile.fundingRounds}
          currentFundingRound=${updatedProfile.currentFundingRound}
          ${fundingTypeField}=${updatedProfile[fundingTypeField]}
        `);
      } else {
        console.warn(`⚠️ BusinessProfileForm update returned null`);
      }
    }

    // 6️⃣ Update Investment doc itself
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

    // 7️⃣ Update MyInvestment investors array
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

    // 8️⃣ Send notifications
    const interestedInvestors = await InterestedInvestor.find({ investment_id });
    for (const investor of interestedInvestors) {
      await Notification.create({
        user_id: investor.user_id,
        title: "Investment Status Update",
        message: `Your investment in "${investment.title}" has been ${status}.`
      });
    }

    // 9️⃣ Respond
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