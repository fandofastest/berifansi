const express = require('express');
const spkController = require('../controllers/spkcontroller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { body } = require('express-validator'); // Add this import

// Add status validation middleware
const statusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['draft', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
];

const router = express.Router();

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, spkController.createSpk);
router.put('/:id', authenticate, isAdmin, spkController.updateSpk);

// Public routes
router.get('/', spkController.getAllSpks);
router.get('/:id', spkController.getSpkById);
router.patch('/:id/status', authenticate, isAdmin, statusValidation, spkController.updateSpkStatus);
router.delete('/:id', authenticate, isAdmin, spkController.deleteSpk);

module.exports = router;