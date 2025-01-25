const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path'); // Import for static file serving
const connectDB = require('./Config/db'); // Import the MongoDB connection function
const studentRoutes = require('./Route/Studentroute');
const teacherRoutes = require('./Route/Teacherroute');

dotenv.config(); // Load environment variables

const app = express(); // Initialize Express app
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded data
app.use(express.static(path.join(__dirname, 'Public'))); // Serve static files

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

// Serve Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'index.html')); // Serve the landing page
});

// Serve Registration Pages
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'register.html'));
});
app.get('/register/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'registerStudent.html'));
});
app.get('/register/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'registerTeacher.html'));
});

// Serve Login Page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'login.html')); // Serve the login page
});

// Serve Registration Success Page
app.get('/register-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'registerSuccess.html')); // Registration success page
});

// Serve Student Homepage
app.get('/student-homepage', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'studentHomepage.html')); // Student homepage
});

// Serve Teacher Homepage
app.get('/teacher-homepage', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'teacherHomepage.html')); // Teacher homepage
});


// User Profile
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'View', 'profile.html')); // User Profile 
});


// Handle Login Requests
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user is a student
    const Student = require('./Model/studentModel');
    const student = await Student.findOne({ email, password });
    if (student) {
      return res.redirect('/student-homepage'); // Redirect to Student Homepage
    }

    // Check if user is a teacher
    const Teacher = require('./Model/teacherModel');
    const teacher = await Teacher.findOne({ email, password });
    if (teacher) {
      return res.redirect('/teacher-homepage'); // Redirect to Teacher Homepage
    }

    // If no user found
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
