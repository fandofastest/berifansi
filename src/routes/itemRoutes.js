const express = require('express');
const { body } = require('express-validator');
const itemController = require('../controllers/itemController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const itemValidation = [
  body('itemCode').notEmpty().withMessage('Item code is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.get('/category/:categoryId', itemController.getItemsByCategory);
router.get('/subcategory/:subCategoryId', itemController.getItemsBySubCategory);

// Protected routes - Admin only
router.post('/', authenticate, isAdmin, itemValidation, itemController.createItem);
router.put('/:id', authenticate, isAdmin, itemValidation, itemController.updateItem);
router.delete('/:id', authenticate, isAdmin, itemController.deleteItem);
router.post('/:id/rates', authenticate, isAdmin, itemController.addItemRate);
router.put('/:id/rates', authenticate, isAdmin, itemController.updateItemRate);
router.delete('/:id/rates/:rateCode', authenticate, isAdmin, itemController.removeItemRate);
router.patch(
  '/:itemId/activate-rate/:rateCode',
  authenticate,
  isAdmin,
  itemController.activateItemRate
);

module.exports = router;