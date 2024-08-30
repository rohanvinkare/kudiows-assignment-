const express = require('express');
const router = express.Router();
const passport = require('passport');
const cookieParser = require('cookie-parser');

const { registerValidation, loginValidation } = require('../validators/user-validator');
const authController = require('../controllers/auth-controller');
const validate = require('../middleware/validation-middleware');
const { authenticateToken } = require('../middleware/auth-middleware');
const { rateLimiter } = require('../utils/rate-limit');


// Initialize passport
router.use(cookieParser());
router.use(passport.initialize());
router.use(passport.session());




/****************************** OAuth *********************************/

// Google OAuth Routes
router.get('/auth/google', rateLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    if (req.user && req.user.token) {
        const { token } = req.user;
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        return res.status(200).json({ message: 'Login successful', token });
    } else {
        return res.status(401).json({ error: 'Authentication failed' });
    }
});




/****************************** Local Auth *********************************/


// Register route
router.post('/auth/register', registerValidation, validate, authController.register);


// Login route with rate limiter applied
router.post('/auth/login', rateLimiter, loginValidation, validate, authController.login);


// Logout route
router.post('/auth/logout', authController.logout);

// to check if OTP is valid
router.post('/auth/verify-otp', authController.verifyRegistrationOTP);

module.exports = router;
