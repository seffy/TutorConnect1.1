const Teacher = require('../Model/teacherModel');

// Existing loginTeacher remains unchanged
exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const teacher = await Teacher.findOne({ email, password });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.sendFile(path.join(__dirname, '../View', 'teacherHomepage.html')); // Redirect to Teacher Homepage
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Registration logic with redirect to success page
exports.registerTeacher = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newTeacher = new Teacher({ name, email, password });
    await newTeacher.save();

    res.redirect('/register-success'); // Redirect to success page
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
