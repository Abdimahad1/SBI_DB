const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getInvestments,
  updateInvestment,
  deleteInvestment
} = require('../controllers/investmentController');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createInvestment);
router.get('/', authMiddleware, getInvestments);
router.patch('/:id', authMiddleware, updateInvestment);
router.delete('/:id', authMiddleware, deleteInvestment);

module.exports = router;
