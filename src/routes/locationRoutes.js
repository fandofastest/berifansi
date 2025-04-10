const express = require('express');
const locationController = require('../controllers/locationController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, locationController.createLocation);
router.put('/:id', authenticate, isAdmin, locationController.updateLocation);
router.delete('/:id', authenticate, isAdmin, locationController.deleteLocation);

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;