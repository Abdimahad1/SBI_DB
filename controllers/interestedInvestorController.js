const InterestedInvestor = require('../models/InterestedInvestor');
const MyInvestment = require('../models/MyInvestment');

exports.createInterestedInvestor = async (req, res) => {
  try {
    const { investment_id, name, email, message, image, title, purpose, goalAmount, currentContribution } = req.body;
    const user_id = req.userId;

    // Check if the investment exists
    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const newInvestor = await InterestedInvestor.create({
      investment_id,
      user_id,
      name,
      email,
      message,
      image,
      title,
      purpose,
      goalAmount,
      currentContribution,
      status: investment.status // Use the status from MyInvestment
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error('❌ Failed to save interested investor:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getInterestedInvestors = async (req, res) => {
  try {
    // First get all interested investors
    const investors = await InterestedInvestor.find();
    
    // Then update their status from MyInvestment collection
    const updatedInvestors = await Promise.all(investors.map(async (inv) => {
      try {
        const investment = await MyInvestment.findOne({ investment_id: inv.investment_id });
        if (investment && investment.status !== inv.status) {
          // Update status in InterestedInvestor if different
          await InterestedInvestor.findByIdAndUpdate(inv._id, { status: investment.status });
          return { ...inv._doc, status: investment.status };
        }
        return inv;
      } catch (err) {
        console.error('Error syncing status for investor:', inv._id, err);
        return inv;
      }
    }));

    res.json(updatedInvestors);
  } catch (err) {
    console.error('❌ Failed to fetch investors:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add this new controller method
exports.updateInvestorStatus = async (req, res) => {
    try {
      const { investment_id, status } = req.body;
      
      // Validate input
      if (!investment_id || !status) {
        return res.status(400).json({ message: 'investment_id and status are required' });
      }
  
      // Update both collections in a transaction
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const [updatedInvestment, updatedInvestor] = await Promise.all([
          MyInvestment.findOneAndUpdate(
            { investment_id },
            { status },
            { new: true, session }
          ),
          InterestedInvestor.findOneAndUpdate(
            { investment_id },
            { status },
            { new: true, session }
          )
        ]);
  
        if (!updatedInvestment || !updatedInvestor) {
          await session.abortTransaction();
          return res.status(404).json({ message: 'Investment not found in one or both collections' });
        }
  
        await session.commitTransaction();
        res.json({
          success: true,
          myInvestment: updatedInvestment,
          interestedInvestor: updatedInvestor
        });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
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