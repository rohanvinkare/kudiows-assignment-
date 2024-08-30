const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,  // Required for all users
        unique: true     // Ensure email is unique across users
    },
    username: {
        type: String,
        required: false,  // Optional for OAuth users
        // Remove or comment out unique constraint
        // unique: true
    },
    password: {
        type: String,
        required: false  // Optional for OAuth users
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'registered'],
        default: 'pending'
    } // Field to store OTP expiration time
    ,
    role: {
        type: String,
        default: 'user'  // Default role
    },
    oauthProvider: {
        type: String,
        required: false  // Optional, to track the provider (e.g., 'google', 'github')
    },
    dateCreated: {
        type: Date,
        default: Date.now  // Default to the current date
    },
    resumePath: {
        type: String,
        resumePath: String,
        default: null
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
