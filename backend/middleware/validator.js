const { check, validationResult } = require('express-validator');

const validateRegister = [
    check('name').isLength({ min: 4 }).withMessage('Name must be at least 4 characters'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

const validateLogin = [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
]

module.exports = { validateRegister, validateLogin };