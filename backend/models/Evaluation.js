const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Submission',
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  grade: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
