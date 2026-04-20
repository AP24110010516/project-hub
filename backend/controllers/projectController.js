const Project = require('../models/Project');

const createProject = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const project = new Project({
      title,
      description,
      deadline,
      createdBy: req.user._id,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Submission = require('../models/Submission');

const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === 'faculty') {
      query = { createdBy: req.user._id };
    }
    const projects = await Project.find(query).populate('createdBy', 'name email').lean();
    
    // Add submission count to each project
    for (let project of projects) {
      project.submissionCount = await Submission.countDocuments({ projectId: project._id });
    }
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.deadline = deadline || project.deadline;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, updateProject };
