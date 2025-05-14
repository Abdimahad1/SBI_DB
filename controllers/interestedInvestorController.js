const InterestedInvestor = require('../models/InterestedInvestor');
const MyInvestment = require('../models/MyInvestment');

exports.createInterestedInvestor = async (req, res) => {
  try {
    const { investment_id, name, email, message, image, title, purpose, goalAmount, currentContribution } = req.body;
    const user_id = req.userId;

    const investment = await MyInvestment.findOne({ investment_id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const newInvestor = await InterestedInvestor.create({
      investment_id,
      user_id,
      businessId: investment.businessId,
      name,
      email,
      message,
      image,
      title,
      purpose,
      goalAmount,
      currentContribution,
      status: investment.status
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error('❌ Failed to save interested investor:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET interested investors for current business owner
exports.getInterestedInvestors = async (req, res) => {
  try {
    const userId = req.userId; // this is the business owner's ID

    // ✅ Get only investors interested in *this* business owner's investments
    const investments = await InterestedInvestor.find({ businessId: userId });

    res.status(200).json(investments);
  } catch (err) {
    console.error('Error fetching interested investors:', err);
    res.status(500).json({ message: 'Failed to fetch interested investors' });
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