const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./Model/studentModel');
const Teacher = require('./Model/teacherModel');

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Insert sample students
    await Student.insertMany([
      { name: 'John Doe', email: 'john@student.com', password: 'password123' },
      { name: 'Jane Doe', email: 'jane@student.com', password: 'password123' },
    ]);

    // Insert sample teachers
    await Teacher.insertMany([
      { name: 'Dr. Smith', email: 'smith@teacher.com', password: 'password123' },
      { name: 'Ms. Johnson', email: 'johnson@teacher.com', password: 'password123' },
    ]);

    console.log('Sample data inserted successfully');
    process.exit(); // Exit after inserting
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1); // Exit with failure
  }
};

connectDB();
