const express = require('express');
const router = express.Router();

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');

const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/', authMiddleware, createGoal);
router.get('/', authMiddleware, getGoals);
router.patch('/:id', authMiddleware, updateGoal);
router.delete('/:id', authMiddleware, deleteGoal);

module.exports = router;
