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
    console.log('Received update request with data:', req.body);
    const { user_id } = req.user;
    const fundingData = req.body;

    // Validate required fields
    const requiredFields = [
      'businessName', 'foundedYear', 'marketCategory',
      'countryCode', 'city'
    ];
    
    for (const field of requiredFields) {
      if (!fundingData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // List of all funding fields in sequence
    const fundingSequence = [
      'seedFunding',
      'angelFunding',
      'ventureFunding',
      'convertibleNote',
      'equityCrowdfunding',
      'debtFinancing',
      'privateEquity',
      'postIpoEquity'
    ];

    // Calculate total funding and rounds from individual fields
    let totalFunding = 0;
    let fundingRounds = 0;
    let currentFundingRound = 'seedFunding';
    
    const update = { $set: {} };
    
    // Process each funding field
    fundingSequence.forEach((field) => {
      const value = parseFloat(fundingData[field]) || 0;
      update.$set[field] = value;
      
      if (value > 0) {
        totalFunding += value;
        fundingRounds++;
        currentFundingRound = field; // This will end up as the last non-zero field
      }
    });

    // Set the calculated values
    update.$set.fundingTotalUSD = totalFunding;
    update.$set.fundingRounds = fundingRounds;
    update.$set.currentFundingRound = currentFundingRound;

    // Update other non-funding fields
    update.$set.businessName = fundingData.businessName;
    update.$set.foundedYear = fundingData.foundedYear;
    update.$set.businessStatus = fundingData.businessStatus || 'operating';
    update.$set.marketCategory = fundingData.marketCategory;
    update.$set.countryCode = fundingData.countryCode;
    update.$set.city = fundingData.city;

    console.log('Preparing database update:', update); // Debug log

    const updatedProfile = await BusinessProfileForm.findOneAndUpdate(
      { user_id },
      update,
      { new: true, upsert: true }
    ).lean();

    console.log('Update successful, returning profile:', updatedProfile); // Debug log

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Business profile updated successfully'
    });
  } catch (error) {
    console.error('Update business funding error:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update business funding',
      error: error.message
    });
  }
};

// PATCH: update investment status with progressive round goals
exports.updateStatusByInvestmentId = async (req, res) => {
  const { investment_id, status } = req.body;

  if (!investment_id || !status) {
    return res.status(400).json({ success: false, message: "Missing investment_id or status" });
  }

  try {
    // 1️⃣ Get the MyInvestment record
    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    const previousStatus = investment.status;
    const currentContribution = investment.currentContribution || 0;
    const businessId = investment.businessId;

    investment.status = status;
    await investment.save();

    // 2️⃣ Get the BusinessProfileForm
    const profile = await BusinessProfileForm.findOne({ user_id: businessId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }

    // 3️⃣ Define funding sequence with progressive goals
    const fundingSequence = [
      { field: "seedFunding", goal: 5000 },
      { field: "angelFunding", goal: 10000 },
      { field: "ventureFunding", goal: 20000 },
      { field: "convertibleNote", goal: 40000 },
      { field: "equityCrowdfunding", goal: 50000 },
      { field: "debtFinancing", goal: 60000 },
      { field: "privateEquity", goal: 70000 },
      { field: "postIpoEquity", goal: 80000 }
    ];

    // Determine current funding round
    let currentRoundIndex = fundingSequence.findIndex(round => round.field === profile.currentFundingRound);
    if (currentRoundIndex === -1) currentRoundIndex = 0;
    let currentRound = fundingSequence[currentRoundIndex];
    
    // Build the update object
    const update = { $set: {}, $inc: {} };
    let remainingContribution = currentContribution;

    // Only process if status is changing to accepted
    if (status === "accepted" && previousStatus !== "accepted") {
      // Process through rounds until all contribution is allocated
      while (remainingContribution > 0 && currentRoundIndex < fundingSequence.length) {
        currentRound = fundingSequence[currentRoundIndex];
        const currentField = currentRound.field;
        const currentGoal = currentRound.goal;
        const currentAmount = profile[currentField] || 0;
        
        // Calculate how much can be added to this round
        const remainingInRound = Math.max(0, currentGoal - currentAmount);
        const allocation = Math.min(remainingContribution, remainingInRound);
        
        if (allocation > 0) {
          // Add to this round's total
          update.$inc[currentField] = allocation;
          update.$inc.fundingTotalUSD = allocation;
          remainingContribution -= allocation;
          
          // Check if this completes the round
          if ((currentAmount + allocation) >= currentGoal) {
            // Move to next round if there's more contribution or this round is complete
            if (remainingContribution > 0 || (currentAmount + allocation) >= currentGoal) {
              currentRoundIndex++;
              if (currentRoundIndex < fundingSequence.length) {
                update.$set.currentFundingRound = fundingSequence[currentRoundIndex].field;
              }
              update.$inc.fundingRounds = 1;
            }
          }
        } else {
          // Move to next round if current round is already full
          currentRoundIndex++;
          if (currentRoundIndex < fundingSequence.length) {
            update.$set.currentFundingRound = fundingSequence[currentRoundIndex].field;
          }
        }
      }
      
      // If we still have remaining after all rounds, add to last round
      if (remainingContribution > 0) {
        const lastRound = fundingSequence[fundingSequence.length - 1].field;
        update.$inc[lastRound] = remainingContribution;
        update.$inc.fundingTotalUSD = remainingContribution;
      }
    }
    else if (status === "rejected" && previousStatus === "accepted") {
      // Rollback logic
      const investorEntry = investment.investors.find(
        inv => inv.investorId.toString() === investment.investorId.toString()
      );
      
      if (investorEntry && investorEntry.fundingType) {
        update.$inc = {
          fundingTotalUSD: -currentContribution,
          [investorEntry.fundingType]: -currentContribution
        };
      }
    }

    // 4️⃣ Apply updates to BusinessProfileForm
    if (Object.keys(update.$set).length > 0 || Object.keys(update.$inc).length > 0) {
      await BusinessProfileForm.findOneAndUpdate(
        { user_id: businessId },
        update,
        { new: true }
      );
    }

    // 5️⃣ Update Investment doc itself
    const parentInvestment = await Investment.findOne({ _id: investment_id });
    if (parentInvestment) {
      if (status === "accepted" && previousStatus !== "accepted") {
        await Investment.updateOne(
          { _id: investment_id },
          { $inc: { currentContribution: currentContribution } }
        );
      } else if (status === "rejected" && previousStatus === "accepted") {
        await Investment.updateOne(
          { _id: investment_id },
          { $inc: { currentContribution: -currentContribution } }
        );
      }
    }

    // 6️⃣ Update MyInvestment investors array
    if (status === "accepted" && previousStatus !== "accepted") {
      investment.totalRaised += currentContribution;
      investment.interestedCount += 1;
      investment.investors.push({
        investorId: investment.investorId,
        amount: currentContribution,
        date: new Date(),
        fundingType: currentRound.field
      });
      await investment.save();
    }

    // 7️⃣ Send notifications
    const interestedInvestors = await InterestedInvestor.find({ investment_id });
    for (const investor of interestedInvestors) {
      await Notification.create({
        user_id: investor.user_id,
        title: "Investment Status Update",
        message: `Your investment in "${investment.title}" has been ${status}.`
      });
    }

    res.json({
      success: true,
      data: investment,
      currentRound: currentRound.field,
      nextRound: fundingSequence[currentRoundIndex]?.field || "N/A"
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