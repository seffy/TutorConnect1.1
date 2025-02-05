const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, (req, res) => {
    // Query both users and their online status
    const sql = `
        SELECT u.id, u.username, COALESCE(os.is_online, 0) as is_online
        FROM users u
        LEFT JOIN online_status os ON u.id = os.user_id
        WHERE u.role = 'teacher'
    `;
    
    db.all(sql, [], (err, teachers) => {
        if (err) {
            console.error('Error fetching teachers:', err);
            return res.status(500).json({ error: 'Failed to fetch teachers' });
        }
        res.json(teachers);
    });
});

module.exports = router;