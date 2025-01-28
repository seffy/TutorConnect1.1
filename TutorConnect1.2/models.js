const mongoose = require('mongoose');

// Requests Schema
const requestSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  message: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
});
const Request = mongoose.model('Request', requestSchema);

// Conversations Schema
const conversationSchema = new mongoose.Schema({
  chatID: { type: String, required: true },
  tutorID: { type: String, required: true },
  studentID: { type: String, required: true },
  messages: { type: [String], required: true },
  date: { type: Date, default: Date.now },
});
const Conversation = mongoose.model('Conversation', conversationSchema);

// Tutor Schema
const tutorSchema = new mongoose.Schema({
  tutorID: { type: String, required: true },
  name: { type: String, required: true },
  empStatus: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'], required: true },
});
const Tutor = mongoose.model('Tutor', tutorSchema);

// Sessions Schema
const sessionSchema = new mongoose.Schema({
  sessionID: { type: String, required: true },
  tutorID: { type: String, required: true },
  topicTitle: { type: String, required: true },
  schedule: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], required: true },
});
const Session = mongoose.model('Session', sessionSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  feedbackID: { type: String, required: true },
  sessionID: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, required: false },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Export models for use in other files
module.exports = { Request, Conversation, Tutor, Session, Feedback };