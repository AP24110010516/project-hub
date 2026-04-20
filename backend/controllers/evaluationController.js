const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');

const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId, grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('projectId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.projectId && submission.projectId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to evaluate this submission' });
    }

    const evaluation = new Evaluation({
      submissionId,
      facultyId: req.user._id,
      grade,
      feedback,
    });

    const createdEvaluation = await evaluation.save();

    submission.status = 'evaluated';
    await submission.save();

    res.status(201).json(createdEvaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentEvaluations = async (req, res) => {
  try {
    // Find all submissions by this student
    const submissions = await Submission.find({ studentId: req.user._id });
    const submissionIds = submissions.map(sub => sub._id);

    const evaluations = await Evaluation.find({ submissionId: { $in: submissionIds } })
      .populate({
        path: 'submissionId',
        populate: {
          path: 'projectId',
          select: 'title'
        }
      })
      .populate('facultyId', 'name');

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { evaluateSubmission, getStudentEvaluations };
