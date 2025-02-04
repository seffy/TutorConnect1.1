const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher } = require('../Controller/teachercontroller'); 

// Teacher registration route
router.post('/register', registerTeacher);

// Teacher login route
router.post('/login', loginTeacher);

module.exports = router;
