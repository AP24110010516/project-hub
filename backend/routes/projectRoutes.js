const express = require('express');
const { createProject, getProjects, updateProject } = require('../controllers/projectController');
const { protect, faculty } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, faculty, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .put(protect, faculty, updateProject);

module.exports = router;
