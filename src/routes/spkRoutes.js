const express = require('express');
// Change this line

// To this
const spkController = require('../controllers/spkController');
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
router.post('/', authenticate, isAdmin, spkcontroller.createSpk);
router.put('/:id', authenticate, isAdmin, spkcontroller.updateSpk);

// Public routes
router.get('/', spkcontroller.getAllSpks);
router.get('/:id', spkcontroller.getSpkById);
router.patch('/:id/status', authenticate, isAdmin, statusValidation, spkcontroller.updateSpkStatus);
router.delete('/:id', authenticate, isAdmin, spkcontroller.deleteSpk);

module.exports = router;