const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.param,
            message: error.msg
        }));

        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Validation failed',
            errors: errorDetails
        });
    }

    next();
};

module.exports = validate;
