
const User = require('../models/user-model');
require('dotenv').config("./.env");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenCache = require('../utils/cache');
const { sendOTP, generateOTP, verifyOTP } = require('../services/otp-service');

const JWT_SECRET = process.env.JWT_SECRET;

// Handler for user registration

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if email already exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.status === 'pending') {
                // User exists and is pending, generate and send a new OTP
                const otpCode = generateOTP();
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

                user.otp = otpCode;
                user.otpExpires = otpExpires;
                await user.save();
                await sendOTP(email, otpCode);

                return res.status(200).json({ message: 'Existing user - new OTP sent' });
            } else {
                return res.status(400).json({ error: 'Email already in use and user is registered' });
            }
        }

        // Create new user with OTP and pending status
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        user = new User({
            email,
            password: await bcrypt.hash(password, 10),
            otp: otpCode,
            otpExpires,
            status: 'pending'
        });

        // Save user and send OTP
        await user.save();
        await sendOTP(email, otpCode);

        res.status(201).json({ message: 'User registration initiated, OTP sent' });
    } catch (err) {
        console.error('Registration Error:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// Handler for verifying registration OTP
exports.verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;


        // Check for required fields
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify OTP
        if (!verifyOTP(otp) || user.otpExpires < Date.now()) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Update user status to 'registered' and clear OTP fields
        user.status = 'registered';
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully, user registration completed' });
    } catch (err) {
        console.error('OTP Verification Error:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Handler for user login
exports.login = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Check for required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // If username is provided, check if it matches the user's username
        if (username && user.username !== username) {
            return res.status(401).json({ error: 'Invalid username' });
        }

        // Check if user password exists
        if (!user.password) {
            return res.status(500).json({ error: 'User password not found' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Store token in cache and set it in HTTP-only cookie
        tokenCache.set(user.email, token);
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

        // Check user role and respond accordingly
        if (user.role === 'admin') {
            // Special status code for admin users
            res.status(201).json({ message: 'Login successful - Admin', token });
        } else {
            res.status(200).json({ message: 'Login successful', token });
        }
    } catch (err) {
        console.error('Login Error:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Handler for user logout
exports.logout = (req, res) => {
    try {

        const email = req.body.email || req.query.email || req.headers['email'] || tokenCache.get(user.email);


        if (!email && !username) {
            return res.status(400).json({ error: 'No email or username provided' });
        }

        // Determine cache key based on provided data
        const cacheKey = email || username;
        tokenCache.del(cacheKey); // Remove token from cache
        res.clearCookie('auth_token'); // Clear the cookie

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout Error:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};