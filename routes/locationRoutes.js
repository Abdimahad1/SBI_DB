const express = require('express');
const router = express.Router();

const {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');

const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/', authMiddleware, createLocation);
router.get('/', authMiddleware, getLocations);
router.patch('/:id', authMiddleware, updateLocation);
router.delete('/:id', authMiddleware, deleteLocation);

module.exports = router;
