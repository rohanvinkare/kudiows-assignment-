const { body } = require('express-validator');

// Validation rules for registration
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// Validation rules for login
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .exists()
        .withMessage('Password is required')
];

module.exports = {
    registerValidation,
    loginValidation
};
