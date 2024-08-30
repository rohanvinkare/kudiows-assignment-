
require('dotenv').config();

const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send OTP via email
const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email address
        to: email, // Recipient email address
        subject: 'Your OTP Code',
        text: `Your OTP code for Generale Authentication project  is ${otp}. It is valid for 5 minutes.` // Email body
    };

    try {
        await transporter.sendMail(mailOptions); // Attempt to send the email
    } catch (error) {

        console.error('Error sending OTP:', error.message);

        throw new Error('Failed to send OTP. Please try again later.');
    }
};

// Function to generate OTP
const generateOTP = () => {
    try {
        return speakeasy.totp({
            secret: process.env.OTP_SECRET,
            encoding: 'base32' // Encoding format for the OTP
        });
    } catch (error) {

        console.error('Error generating OTP:', error.message);

        throw new Error('Failed to generate OTP. Please try again later.');
    }
};

// Function to verify OTP
const verifyOTP = (token) => {
    try {
        return speakeasy.totp.verify({
            secret: process.env.OTP_SECRET,
            encoding: 'base32', // Encoding format for the OTP
            token, // OTP token to verify
            window: 1 // Allow a 1-minute window for OTP validity
        });
    } catch (error) {

        console.error('Error verifying OTP:', error.message);

        throw new Error('Failed to verify OTP. Please try again later.');
    }
};

module.exports = { sendOTP, generateOTP, verifyOTP }; 
