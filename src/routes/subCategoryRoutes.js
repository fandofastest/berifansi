const express = require('express');
const { body } = require('express-validator');
const subCategoryController = require('../controllers/subCategoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const subCategoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', subCategoryController.getAllSubCategories);
router.get('/category/:categoryId', subCategoryController.getSubCategoriesByCategory);
router.get('/:id', subCategoryController.getSubCategoryById);

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, subCategoryValidation, subCategoryController.createSubCategory);
router.put('/:id', authenticate, isAdmin, subCategoryValidation, subCategoryController.updateSubCategory);
router.delete('/:id', authenticate, isAdmin, subCategoryController.deleteSubCategory);

module.exports = router;