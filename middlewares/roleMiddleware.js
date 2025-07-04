// roleMiddleware.js

exports.checkBusinessOwner = (req, res, next) => {
  if (req.userRole !== 'BusinessOwner') {
    return res.status(403).json({ message: 'Access denied. Business owners only.' });
  }
  next();
};

exports.checkInvestor = (req, res, next) => {
  if (req.userRole !== 'Investor') {
    return res.status(403).json({ message: 'Access denied. Investors only.' });
  }
  next();
};

exports.checkAdmin = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
