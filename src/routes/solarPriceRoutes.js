const express = require('express');
const solarPriceController = require('../controllers/solarPriceController');
const router = express.Router();

router.post('/', solarPriceController.createSolarPrice);
router.get('/', solarPriceController.getAllSolarPrices);
// Add this route before the /:id route
router.get('/current-price', solarPriceController.getCurrentPrice);

// Keep this route after
router.get('/:id', solarPriceController.getSolarPriceById);
router.put('/:id', solarPriceController.updateSolarPrice);
router.delete('/:id', solarPriceController.deleteSolarPrice);

module.exports = router;