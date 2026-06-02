const { check, validationResult } = require('express-validator');

// Shared password rule: at least 8 chars with upper, lower and a number.
const strongPassword = (field) =>
    check(field)
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain a number');

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateRegister = [
    check('name')
        .isString()
        .trim()
        .isLength({ min: 4 })
        .withMessage('Name must be at least 4 characters'),
    check('email')
        .isString()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    strongPassword('password'),
    handleValidation,
];

const validateLogin = [
    check('email')
        .isString()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    check('password').isString().notEmpty().withMessage('Password is required'),
    handleValidation,
];

const validateChangePassword = [
    check('oldPassword').isString().notEmpty().withMessage('Current password is required'),
    strongPassword('newPassword'),
    handleValidation,
];

module.exports = { validateRegister, validateLogin, validateChangePassword };
