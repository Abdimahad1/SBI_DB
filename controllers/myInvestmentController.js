// controllers/myInvestmentController.js
const MyInvestment = require('../models/MyInvestment');

exports.createMyInvestment = async (req, res) => {
    try {
      const { businessId, title, goalAmount, currentContribution, reason, image, purpose } = req.body;
  
      // 🚫 Check for duplicate
      const existing = await MyInvestment.findOne({
        investorId: req.userId,
        businessId,
        title,
      });
  
      if (existing) {
        return res.status(409).json({ message: 'Investment already exists for this business.' });
      }
  
      // ✅ Create new investment if not duplicate
      const newInvestment = await MyInvestment.create({
        investorId: req.userId,
        businessId,
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
      res.status(500).json({ message: 'Failed to create investment', error: err.message });
    }
  };
  
  

exports.getMyInvestments = async (req, res) => {
  try {
    const myInvestments = await MyInvestment.find({ investorId: req.userId });
    res.json(myInvestments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch investments', error: err.message });
  }
};
