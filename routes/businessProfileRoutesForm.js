const express = require('express');
const router = express.Router();

const {
  saveBusinessProfileForm,
  getBusinessProfileForm,
  getPredictionFields,
  deleteBusinessProfileForm,
  getBusinessProfileByUserId 

} = require('../controllers/businessProfileControllerForm');

const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/', authMiddleware, saveBusinessProfileForm);
router.get('/', authMiddleware, getBusinessProfileForm);
router.get('/:id', authMiddleware, getPredictionFields);
router.delete('/', authMiddleware, deleteBusinessProfileForm);
router.get('/public/:id', getBusinessProfileByUserId);

module.exports = router;