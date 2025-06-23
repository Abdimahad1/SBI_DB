const Investment = require('../models/Investment');
const InterestedInvestor = require('../models/InterestedInvestor');
const MyInvestment = require('../models/MyInvestment');
const ProfileForm = require('../models/BusinessProfileForm');
const Notification = require('../models/Notification');

exports.createInterestedInvestor = async (req, res) => {
  try {
    const {
      investment_id,
      name,
      email,
      message,
      image,
      title,
      purpose,
      goalAmount,
      currentContribution
    } = req.body;

    const user_id = req.userId;

    // ✅ Validate that the investment exists
    const investment = await Investment.findById(investment_id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // ✅ Create InterestedInvestor entry
    const interestedInvestor = await InterestedInvestor.create({
      investment_id,
      user_id,
      businessId: investment.user_id,
      name,
      email,
      message,
      image,
      title,
      purpose,
      goalAmount,
      currentContribution,
      status: 'pending'
    });

    res.status(201).json({ interestedInvestor });

  } catch (err) {
    console.error('❌ Failed to save interested investor:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getInterestedInvestors = async (req, res) => {
  try {
    const userId = req.userId;
    const investments = await InterestedInvestor.find({ businessId: userId });
    res.status(200).json(investments);
  } catch (err) {
    console.error('Error fetching interested investors:', err);
    res.status(500).json({ message: 'Failed to fetch interested investors' });
  }
};

exports.updateInvestorStatus = async (req, res) => {
  try {
    const { investment_id, status } = req.body;

    if (!investment_id || !status) {
      return res.status(400).json({ message: 'investment_id and status are required' });
    }

    // 1️⃣ Update MyInvestment first
    const myInvestment = await MyInvestment.findOne({ investment_id });
    if (!myInvestment) {
      return res.status(404).json({ message: 'MyInvestment not found' });
    }

    const previousStatus = myInvestment.status;
    myInvestment.status = status;
    await myInvestment.save();

    // 2️⃣ Update parent Investment and ProfileForm
    const parentInvestment = await Investment.findById(investment_id);

    if (parentInvestment) {
      let invUpdate = {};
      let profileIncValue = 0;

      if (status === 'accepted' && previousStatus !== 'accepted') {
        invUpdate = { $inc: { currentContribution: myInvestment.currentContribution } };
        profileIncValue = myInvestment.currentContribution;
        console.log(`✅ +$${myInvestment.currentContribution} → Investment + ProfileForm`);
      } else if (status === 'rejected' && previousStatus === 'accepted') {
        invUpdate = { $inc: { currentContribution: -myInvestment.currentContribution } };
        profileIncValue = -myInvestment.currentContribution;
        console.log(`✅ -$${myInvestment.currentContribution} → Investment + ProfileForm`);
      }

      // Update Investment
      if (Object.keys(invUpdate).length > 0) {
        await Investment.updateOne(
          { _id: investment_id },
          invUpdate
        );
      }

      // Update ProfileForm (safe: convert null to 0)
      if (profileIncValue !== 0) {
        const profileDoc = await ProfileForm.findOne({ user_id: parentInvestment.user_id });

        if (profileDoc) {
          // Fix null → 0
          if (profileDoc.fundingTotalUSD == null) {
            profileDoc.fundingTotalUSD = 0;
          }

          profileDoc.fundingTotalUSD += profileIncValue;
          await profileDoc.save();

          console.log(`✅ ProfileForm updated: fundingTotalUSD = ${profileDoc.fundingTotalUSD}`);
        } else {
          // No profile → insert new
          await ProfileForm.create({
            user_id: parentInvestment.user_id,
            fundingTotalUSD: Math.max(profileIncValue, 0),
            fundingRounds: 0
          });
          console.log(`✅ ProfileForm created with fundingTotalUSD = ${profileIncValue}`);
        }
      }

    } else {
      console.warn('⚠️ Parent Investment not found for:', investment_id);
    }

    // 3️⃣ Update InterestedInvestor
    const interestedInvestors = await InterestedInvestor.find({ investment_id });

    for (const investor of interestedInvestors) {
      investor.status = status;
      await investor.save();

      // 4️⃣ Send notification
      try {
        await Notification.create({
          user_id: investor.user_id,
          title: 'Investment Status Update',
          message: `Your investment in "${myInvestment.title}" has been ${status}.`,
        });
      } catch (notifyErr) {
        console.error(`Failed to notify investor ${investor.user_id}:`, notifyErr);
      }
    }

    res.json({ success: true, myInvestment, updatedCount: interestedInvestors.length });
  } catch (err) {
    console.error('❌ Failed to update investor status:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInterestedInvestor = async (req, res) => {
  try {
    await InterestedInvestor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Investor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
