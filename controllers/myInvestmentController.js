const MyInvestment = require('../models/MyInvestment');

// CREATE new investment
exports.createMyInvestment = async (req, res) => {
  try {
    const { businessId, investment_id, title, image, purpose, reason, goalAmount, currentContribution } = req.body;
    const investorId = req.userId;

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
      return res.status(400).json({ 
        success: false,
        message: 'Missing investment_id or status',
        required: ['investment_id', 'status']
      });
    }
  
    try {
      // First check if investment exists
      const investment = await MyInvestment.findOne({ investment_id });
      
      if (!investment) {
        return res.status(404).json({
          success: false,
          message: `Investment not found`,
          suggestion: 'Verify the investment_id exists',
          received_id: investment_id
        });
      }
  
      // Then update it
      const updated = await MyInvestment.findOneAndUpdate(
        { investment_id },
        { status },
        { new: true, runValidators: true }
      );
  
      res.json({
        success: true,
        message: 'Status updated successfully',
        investment: updated
      });
    } catch (err) {
      console.error('Update status error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update status',
        error: err.message
      });
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

