const express = require('express');
const router = express.Router();
const { loginStudent, registerStudent } = require('../Controller/studentcontroller');

// student registration route
router.post('/register', registerStudent);

// Student login route
router.post('/login', loginStudent);

module.exports = router;
