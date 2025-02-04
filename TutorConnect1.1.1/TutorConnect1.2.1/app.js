// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Request, Conversation, Tutor, Session, Feedback } = require('./models');

const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/auth_demo');

//mongoose.connect('mongodb+srv://admin:admin13@cluster0.y0r9q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// Helper to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/tutor-sessions', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tutorform.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(400).send('<h1>Error: Email already in use.</h1>');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id; // Store user ID
      req.session.fullName = user.fullName; // Store full name
      req.session.email = user.email; // Store email in session
      res.redirect('/homepage');
    } else {
      res.status(401).send('<h1>Invalid email or password.</h1>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Internal Server Error.</h1>');
  }
});

app.get('/homepage', isAuthenticated, (req, res) => {
  const fullName = req.session.fullName || 'User';
  res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});



/*
app.get('/tutor', isAuthenticated, (req, res) => {
  const fullName = req.session.fullName || 'User';
  res.sendFile(path.join(__dirname, 'views', 'tutor.html'));
});

*/


// Route to display tutor page
app.get('/tutor', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email;
    const tutor = await Tutor.findOne({ tutorID: studentEmail });
    res.sendFile(path.join(__dirname, 'views', 'tutor.html'));
  } catch (error) {
    console.error('Error checking tutor:', error);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});


// API route to fetch the most recent request

app.get('/api/recent-request', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email; // Get logged-in user's email
    const recentRequest = await Request.findOne({ studentID: studentEmail, status: 'Open' }).sort({ createdAt: -1 });

    if (recentRequest) {
      res.json({
        message: recentRequest.message,
        urgency: recentRequest.urgency,
        status: recentRequest.status,
        date: recentRequest.createdAt.toLocaleString() // Format the date
      });
    } else {
      res.json({
        message: 'No open requests.',
        urgency: 'N/A',
        status: 'N/A',
        date: 'N/A'
      });
    }
  } catch (error) {
    console.error('Error fetching recent request:', error);
    res.status(500).json({
      message: 'Error fetching recent request.',
      urgency: 'N/A',
      status: 'Error',
      date: 'Error'
    });
  }
}); 

/*
app.get('/api/recent-request', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email; // Get logged-in user's email
    const userRequests = await Request.find({ studentID: studentEmail }).sort({ createdAt: -1 });

    if (userRequests.length > 0) {
      const formattedRequests = userRequests.map(request => ({
        message: request.message,
        urgency: request.urgency,
        status: request.status,
        date: request.createdAt.toLocaleString()
      }));

      res.json(formattedRequests);
    } else {
      res.json([]); // Return empty array if no requests are found
    }
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Error fetching user requests' });
  }
});

*/

app.get('/api/recent-request', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email; // Get logged-in user's email
    const recentRequest = await Request.findOne({ studentID: studentEmail, status: 'Open' }).sort({ createdAt: -1 });

    if (recentRequest) {
      res.json({
        message: recentRequest.message,
        urgency: recentRequest.urgency,
        status: recentRequest.status,
        date: recentRequest.createdAt.toLocaleString() // Format the date
      });
    } else {
      res.json({
        message: 'No open requests.',
        urgency: 'N/A',
        status: 'N/A',
        date: 'N/A'
      });
    }
  } catch (error) {
    console.error('Error fetching recent request:', error);
    res.status(500).json({
      message: 'Error fetching recent request.',
      urgency: 'N/A',
      status: 'Error',
      date: 'Error'
    });
  }
});










app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/api/user-info', isAuthenticated, (req, res) => {
  res.json({ fullName: req.session.fullName });
});

// Route to handle new request submissions
app.post('/requests', isAuthenticated, async (req, res) => {
  try {
    const { requestinput, urgency } = req.body;
    const studentEmail = req.session.email; // Get email from session

    // Create a new Request with status set to 'Open'
    const newRequest = new Request({
      studentID: studentEmail,
      message: requestinput,
      urgency: urgency,
      status: 'Open', // Default status set to Open
    });

    // Save the request to the database
    await newRequest.save();

    // Redirect to homepage with success message
    res.redirect('/homepage?message=Request+submitted+successfully!');
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).send('<h1>Error saving request. Please try again.</h1>');
  }
});



// ------------------------ TUTOR API ROUTES ------------------------ //

// API to check if student is a tutor 
/*
app.get('/api/check-tutor', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email;
    const tutor = await Tutor.findOne({ tutorID: studentEmail });
    if (tutor) {
      res.json({ exists: true, name: tutor.name, empStatus: tutor.empStatus });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking tutor:', error);
    res.status(500).json({ exists: false, error: 'Internal Server Error' });
  }
});
*/

// API to check if student is a tutor
app.get('/api/check-tutor', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email;
    const tutor = await Tutor.findOne({ tutorID: studentEmail });
    if (tutor) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking tutor:', error);
    res.status(500).json({ exists: false, error: 'Internal Server Error' });
  }
});


// API to register as a tutor
app.post('/api/register-tutor', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.session.email;
    const fullName = req.session.fullName;

    const newTutor = new Tutor({
      tutorID: studentEmail,
      name: fullName,
      empStatus: 'Active',
    });

    await newTutor.save();
    res.json({ success: true, message: 'Registered successfully!' });
  } catch (error) {
    console.error('Error registering tutor:', error);
    res.status(500).json({ success: false, message: 'Error registering tutor' });
  }
});

// API to fetch recent open requests (one per student)
app.get('/api/recent-requests', isAuthenticated, async (req, res) => {
  try {
    const recentRequests = await Request.aggregate([
      { $match: { status: 'Open' } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$studentID", latestRequest: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestRequest" } }
    ]);

    res.json(recentRequests);
  } catch (error) {
    console.error('Error fetching recent requests:', error);
    res.status(500).json({ error: 'Error fetching recent requests' });
  }
});

app.get('/api/student-info', isAuthenticated, async (req, res) => {
  try {
    const studentEmail = req.query.email;
    const student = await User.findOne({ email: studentEmail });

    if (student) {
      res.json({ fullName: student.fullName });
    } else {
      res.json({ fullName: null });
    }
  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ error: 'Error fetching student info' });
  }
});




// Route to display tutor homepage
app.get('/tutorhomepage', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tutorhomepage.html'));
});



// Add Session

app.post('/api/add-session', isAuthenticated, async (req, res) => {
  try {
    const { topicTitle, date, timeStart, endTime, status } = req.body;
    const tutorID = req.session.email; // Get logged-in tutor's email

    // Generate a unique 6-digit sessionID
    const sessionID = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new session entry
    const newSession = new Session({
      sessionID,
      tutorID,
      topicTitle,
      date: new Date(date),
      timeStart,
      endStart: endTime,
      status
    });

    await newSession.save();
    res.json({ success: true, message: 'Session created successfully!' });

  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ success: false, message: 'Error adding session' });
  }
});

//fetch all sessions

app.get('/api/sessions', isAuthenticated, async (req, res) => {
  try {
    const tutorID = req.session.email; // Get the logged-in tutor's email
    const sessions = await Session.find({ tutorID }).sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    res.status(500).json({ error: 'Error fetching tutor sessions' });
  }
});








// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
