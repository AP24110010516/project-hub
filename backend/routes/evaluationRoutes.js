const express = require('express');
const { evaluateSubmission, getStudentEvaluations } = require('../controllers/evaluationController');
const { protect, faculty, student } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, faculty, evaluateSubmission);
router.get('/student', protect, student, getStudentEvaluations);

module.exports = router;
