const express = require('express');
const router = express.Router();

const {
  saveBusinessProfileForm,
  getBusinessProfileForm,
  getPredictionFields,
  deleteBusinessProfileForm,
  getBusinessProfileByUserId,
  updateBusinessProfileForm // Add this new import
} = require('../controllers/businessProfileControllerForm');

const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/', authMiddleware, saveBusinessProfileForm);
router.put('/', authMiddleware, updateBusinessProfileForm); // Add this new PUT route
router.get('/', authMiddleware, getBusinessProfileForm);
router.get('/:id', authMiddleware, getPredictionFields);
router.delete('/', authMiddleware, deleteBusinessProfileForm);
router.get('/public/:id', getBusinessProfileByUserId);

module.exports = router;