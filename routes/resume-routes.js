// routes/resume-routes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer-middleware');
const { authenticateToken } = require('../middleware/auth-middleware');
const resumeController = require('../controllers/resume-controller');

// Route to handle resume upload
router.post('/upload-resume', upload.single('resume'), resumeController.uploadResume);

module.exports = router