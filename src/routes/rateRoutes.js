const express = require('express');
const { body } = require('express-validator');
const rateController = require('../controllers/ratecontroller');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const rateValidation = [
  body('item').notEmpty().withMessage('Item is required'),
  body('rateType').notEmpty().withMessage('Rate type is required'),
  body('effectiveDate').notEmpty().withMessage('Effective date is required')
    .isISO8601().withMessage('Effective date must be a valid date')
];

// Public routes
router.get('/', rateController.getAllRates);
router.get('/:id', rateController.getRateById);
router.get('/item/:itemId', rateController.getRatesByItem);
router.get('/product/:productId', rateController.getRatesByProduct);  // Add this new route

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, rateValidation, rateController.createRate);
router.put('/:id', authenticate, isAdmin, rateValidation, rateController.updateRate);
router.delete('/:id', authenticate, isAdmin, rateController.deleteRate);

module.exports = router;