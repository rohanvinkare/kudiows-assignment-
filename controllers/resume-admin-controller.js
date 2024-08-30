const User = require('../models/user-model');
const path = require('path');
const fs = require('fs');

// Get all resumes
exports.getAllResumes = async (req, res) => {
    try {
        // Get all users with resume path
        const users = await User.find({ resumePath: { $exists: true, $ne: null } });
        if (!users.length) {
            return res.status(404).json({ error: 'No resumes found' });
        }

        // Format response
        const resumes = users.map(user => ({
            email: user.email,
            resumePath: user.resumePath.replace('\\', '/'), // Ensure forward slashes in path
            dateCreated: user.dateCreated
        }));

        res.status(200).json({ resumes });
    } catch (err) {
        console.error('Error fetching resumes:', err); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
