const express = require('express');
const { body } = require('express-validator');
const materialUnitController = require('../controllers/materialUnitController');
const { authenticate, isAdmin } = require('../middleware/auth'); // Assuming auth middleware

const router = express.Router();

// Validation rules
const materialUnitValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Material unit name is required')
        .isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
];

// Routes
// Note: You might only need Admin access for create, update, delete
router.post('/', authenticate, isAdmin, materialUnitValidation, materialUnitController.createMaterialUnit);
router.get('/', authenticate, materialUnitController.getAllMaterialUnits); // All authenticated users can view?
router.get('/:id', authenticate, materialUnitController.getMaterialUnitById);
router.put('/:id', authenticate, isAdmin, materialUnitValidation, materialUnitController.updateMaterialUnit);
router.delete('/:id', authenticate, isAdmin, materialUnitController.deleteMaterialUnit);

module.exports = router;