const Submission = require('../models/Submission');
const Project = require('../models/Project');

const submitProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLate = new Date() > new Date(project.deadline);
    const fileUrl = req.file.path;
    const newStatus = isLate ? 'late' : 'submitted';

    let submission = await Submission.findOne({ studentId: req.user._id, projectId });

    if (submission) {
      if (submission.status === 'evaluated') {
        return res.status(400).json({ message: 'Cannot edit submission after evaluation' });
      }
      submission.fileUrl = fileUrl;
      submission.status = newStatus;
      submission.submissionDate = Date.now();
      const updatedSubmission = await submission.save();
      return res.status(200).json(updatedSubmission);
    }

    submission = new Submission({
      studentId: req.user._id,
      projectId,
      fileUrl,
      status: newStatus,
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('projectId', 'title deadline')
      .populate('studentId', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectSubmissions = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (req.user && req.user.role === 'faculty' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }

    const submissions = await Submission.find({ projectId: req.params.id })
      .populate('studentId', 'name email')
      .populate('projectId', 'title');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitProject, getStudentSubmissions, getProjectSubmissions };
