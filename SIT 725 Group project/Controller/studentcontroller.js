const Student = require('../Model/studentModel');

// Existing loginStudent remains unchanged
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const student = await Student.findOne({ email, password });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.sendFile(path.join(__dirname, '../View', 'studentHomepage.html')); // Redirect to Student Homepage
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Registration logic with redirect to success page
exports.registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newStudent = new Student({ name, email, password });
    await newStudent.save();

    res.redirect('/register-success'); // Redirect to success page
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
