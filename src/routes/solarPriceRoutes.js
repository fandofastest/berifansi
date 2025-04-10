const express = require('express');
const solarPriceController = require('../controllers/solarPriceController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, solarPriceController.createSolarPrice);
router.put('/:id', authenticate, isAdmin, solarPriceController.updateSolarPrice);
router.delete('/:id', authenticate, isAdmin, solarPriceController.deleteSolarPrice);

// Public routes
router.get('/', solarPriceController.getAllSolarPrices);
router.get('/latest', solarPriceController.getLatestSolarPrice);

module.exports = router;