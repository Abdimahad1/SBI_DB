const express = require('express');
const router = express.Router();

const {
  saveBusinessProfileForm,
  getBusinessProfileForm,
  deleteBusinessProfileForm
} = require('../controllers/businessProfileControllerForm');

const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/', authMiddleware, saveBusinessProfileForm);
router.get('/', authMiddleware, getBusinessProfileForm);
router.delete('/', authMiddleware, deleteBusinessProfileForm);
module.exports = router;