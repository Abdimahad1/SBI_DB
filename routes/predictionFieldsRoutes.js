const express = require('express');
const router = express.Router();
const {
  syncPredictionFields,
  getPredictionFields
} = require('../controllers/predictionFieldsController');

router.get('/sync/:userId', syncPredictionFields);
router.get('/:userId', getPredictionFields);

module.exports = router;
