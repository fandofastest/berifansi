const express = require('express');
const { body } = require('express-validator');
const spkController = require('../controllers/spkController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const spkValidation = [
  body('spkNo').notEmpty().withMessage('SPK number is required'),
  body('spkTitle').notEmpty().withMessage('SPK title is required'),
  body('projectStartDate')
    .notEmpty().withMessage('Project start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  body('projectEndDate')
    .notEmpty().withMessage('Project end date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.projectStartDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.item').notEmpty().withMessage('Item reference is required'),
  body('items.*.rateCode').notEmpty().withMessage('Rate code is required'),
  // Remove unitRate validation since it will be populated automatically
  body('items.*.estQty.quantity.nr').isNumeric().withMessage('Non-remote quantity must be a number'),
  body('items.*.estQty.quantity.r').isNumeric().withMessage('Remote quantity must be a number')
];

const statusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['draft', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', authenticate, spkController.getAllSpks);
router.get('/status/:status', authenticate, spkController.getSpksByStatus);
router.get('/:id', authenticate, spkController.getSpkById);
router.post('/', authenticate, isAdmin, spkValidation, spkController.createSpk);
router.put('/:id', authenticate, isAdmin, spkValidation, spkController.updateSpk);
router.patch('/:id/status', authenticate, isAdmin, statusValidation, spkController.updateSpkStatus);
router.delete('/:id', authenticate, isAdmin, spkController.deleteSpk);

module.exports = router;