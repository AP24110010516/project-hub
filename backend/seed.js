const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load Models
const User = require('./models/User');
const Project = require('./models/Project');
const Submission = require('./models/Submission');
const Evaluation = require('./models/Evaluation');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-portal');

    console.log('MongoDB connected. Clearing collections...');
    await User.deleteMany();
    await Project.deleteMany();
    await Submission.deleteMany();
    await Evaluation.deleteMany();

    console.log('Seeding Users...');
    // Create Faculty
    const faculty = new User({
      name: 'Dr. Jane Smith',
      email: 'jane.smith@university.edu',
      password: 'password123',
      role: 'faculty'
    });
    await faculty.save();
    
    // Create Students
    const student1 = new User({
      name: 'Alex Johnson',
      email: 'alex.j@student.edu',
      password: 'password123',
      role: 'student'
    });
    const student2 = new User({
      name: 'Maria Garcia',
      email: 'maria.g@student.edu',
      password: 'password123',
      role: 'student'
    });
    await student1.save();
    await student2.save();

    console.log('Seeding Projects...');
    // Create Projects created by Faculty
    const deadline1 = new Date();
    deadline1.setDate(deadline1.getDate() + 7); // Next week
    
    const deadline2 = new Date();
    deadline2.setDate(deadline2.getDate() + 14); // Next two weeks

    const project1 = await Project.create({
      title: 'Machine Learning Final Project',
      description: 'Develop a predictive model using random forest classifiers on the provided dataset.',
      deadline: deadline1,
      createdBy: faculty._id
    });

    const project2 = await Project.create({
      title: 'Web App Architecture Design',
      description: 'Design the microservices architecture for a scalable e-commerce application.',
      deadline: deadline2,
      createdBy: faculty._id
    });

    console.log('Seeding Submissions...');
    // Create Submissions for Projects
    const sub1 = await Submission.create({
      studentId: student1._id,
      projectId: project1._id,
      fileUrl: '/uploads/dummy_Alex_ML.pdf',
      status: 'evaluated'
    });

    const sub2 = await Submission.create({
      studentId: student2._id,
      projectId: project1._id,
      fileUrl: '/uploads/dummy_Maria_ML.pdf',
      status: 'submitted'
    });

    console.log('Seeding Evaluations...');
    // Create Evaluation for sub1
    await Evaluation.create({
      submissionId: sub1._id,
      facultyId: faculty._id,
      grade: 92,
      feedback: 'Excellent work on the feature engineering. Model accuracy is well within expectations.'
    });

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
