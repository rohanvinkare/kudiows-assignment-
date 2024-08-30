const express = require('express');
const router = express.Router();
const { getAllResumes } = require('../controllers/resume-admin-controller');

// Route to get all resumes
router.get('/all-resumes', getAllResumes);

module.exports = router;
