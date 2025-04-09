const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, isAdmin, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username').notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('role').optional().isIn(['super_admin', 'admin', 'mandor'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional(),
  body('email').optional().isEmail().withMessage('Must be a valid email address'),
  body('password').optional().isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const updateUserValidation = [
  body('name').optional(),
  body('email').optional().isEmail().withMessage('Must be a valid email address'),
  body('role').optional().isIn(['super_admin', 'admin', 'mandor'])
    .withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('password').optional().isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes - User
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);

// Protected routes - Admin
router.get('/users', authenticate, isAdmin, authController.getAllUsers);
router.get('/users/:id', authenticate, isAdmin, authController.getUserById);
router.put('/users/:id', authenticate, isAdmin, updateUserValidation, authController.updateUser);

// Protected routes - Super Admin
router.delete('/users/:id', authenticate, isSuperAdmin, authController.deleteUser);

module.exports = router;