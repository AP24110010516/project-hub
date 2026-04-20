const express = require('express');
const { registerUser, loginUser, getFaculties } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/faculties', protect, getFaculties);

module.exports = router;
