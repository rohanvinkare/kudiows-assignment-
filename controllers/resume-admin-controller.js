const User = require('../models/user-model');
const path = require('path');
const fs = require('fs');

// Get all users with email and dateCreated, excluding admins
exports.getAllResumes = async (req, res) => {
    try {
        // Retrieve all users from the database, excluding those with the role 'admin'
        const users = await User.find({ role: { $ne: 'admin' } }, 'email dateCreated'); // Select only email and dateCreated fields

        if (!users.length) {
            return res.status(404).json({ error: 'No users found' });
        }

        // Format response
        const userDetails = users.map(user => ({
            email: user.email,
            dateCreated: user.dateCreated
        }));

        res.status(200).json({ users: userDetails });
    } catch (err) {
        console.error('Error fetching users:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
