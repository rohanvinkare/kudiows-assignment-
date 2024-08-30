const tokenCache = require('../utils/cache');
const { google } = require('googleapis');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

// Configure OAuth2 client using environment variables
const auth = new google.auth.GoogleAuth({
    credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        project_id: process.env.GOOGLE_PROJECT_ID
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'] // Scope for Google Drive API
});

// Create a Drive instance with the authenticated client
const drive = google.drive({ version: 'v3', auth });

/**
 * Convert buffer to readable stream
 * @param {Buffer} buffer
 * @returns {Readable}
 */
function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Signal that the end of the stream is reached
    return stream;
}

/**
 * Upload resume to Google Drive
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Fetch email from the cache
        const email = req.cookies.email; // Assuming email is stored in a cookie
        if (!email) {
            return res.status(400).json({ error: 'User email not found in cache' });
        }

        // Rename the file with the email
        const fileName = `${email}_${req.file.originalname}`;

        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Folder ID in Google Drive
        };

        const media = {
            mimeType: req.file.mimetype,
            body: bufferToStream(req.file.buffer) // Convert buffer to readable stream
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        res.json({
            fileId: response.data.id,
            webViewLink: response.data.webViewLink
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(error.response?.status || 500).json({
            error: error.message || 'An error occurred during file upload'
        });
    }
};
