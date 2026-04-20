const express = require('express');
const { submitProject, getStudentSubmissions, getProjectSubmissions } = require('../controllers/submissionController');
const { protect, student, faculty } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, student, upload.single('file'), submitProject);
router.get('/student', protect, student, getStudentSubmissions);
router.get('/project/:id', protect, faculty, getProjectSubmissions);

module.exports = router;
