const express = require('express');
const { body } = require('express-validator');
const itemCostController = require('../controllers/itemCostController'); // Path remains relative
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating/updating ItemCost
const itemCostValidation = [
  body('nama').trim().notEmpty().withMessage('Name (nama) is required'),
  body('costPerMonth').isNumeric().withMessage('Cost per month must be a number'),
  body('costPerHour').isNumeric().withMessage('Cost per hour must be a number'),
  body('kategori')
    .trim()
    .notEmpty().withMessage('Category (kategori) is required')
    .isIn(['manpower', 'equipment', 'material', 'security'])
    .withMessage('Invalid category'),

  // Conditional validation for material details
  body('details.materialDetails.materialUnit')
    .if(body('kategori').equals('material'))
    .notEmpty().withMessage('Material unit is required for material category')
    .isMongoId().withMessage('Invalid Material Unit ID'),
  body('details.materialDetails.pricePerUnit')
    .if(body('kategori').equals('material'))
    .notEmpty().withMessage('Price per unit is required for material category')
    .isNumeric().withMessage('Price per unit must be a number'),

  // Add conditional validation for other categories as needed
  // Example for security:
  body('details.securityDetails.dailyCost')
    .if(body('kategori').equals('security'))
    .notEmpty().withMessage('Daily cost is required for security category')
    .isNumeric().withMessage('Daily cost must be a number'),

  // Example for equipment:
  body('details.equipmentDetails.fuelConsumptionPerHour')
      .if(body('kategori').equals('equipment'))
      .optional({ checkFalsy: true }) // Make optional or required as needed
      .isNumeric().withMessage('Fuel consumption must be a number'),
  body('details.equipmentDetails.gpsCostPerMonth')
      .if(body('kategori').equals('equipment'))
      .optional({ checkFalsy: true }) // Make optional or required as needed
      .isNumeric().withMessage('GPS cost must be a number'),

  // Example for manpower (overtime array needs more complex validation if required)
  body('details.manpowerDetails.overtime.*.hari')
      .if(body('kategori').equals('manpower'))
      .optional()
      .isString().withMessage('Overtime day must be a string'),
  body('details.manpowerDetails.overtime.*.overtimeRate')
      .if(body('kategori').equals('manpower'))
      .optional()
      .isNumeric().withMessage('Overtime rate must be a number'),

];

// Routes
router.post('/', authenticate, isAdmin, itemCostValidation, itemCostController.createItemCost);
router.get('/', authenticate, itemCostController.getAllItemCosts);
router.get('/:id', authenticate, itemCostController.getItemCostById);
router.get('/category/:category', itemCostController.getItemCostByCategory);
router.put('/:id', authenticate, isAdmin, itemCostValidation, itemCostController.updateItemCost);
router.delete('/:id', authenticate, isAdmin, itemCostController.deleteItemCost);

module.exports = router;