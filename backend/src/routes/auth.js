const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Validation rules for registration
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('Password must contain at least one letter and one number.'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;