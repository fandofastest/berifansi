const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional()
];

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, categoryValidation, categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, categoryValidation, categoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;