const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const register = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: "All fields required" });
    }

    if (role !== 'teacher' && role !== 'learner') {
        return res.status(400).json({ error: "Invalid role" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.run(sql, [username, hashedPassword, role], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "Username already exists" });
                }
                return res.status(500).json({ error: "Error creating user" });
            }

            // Add online status record for new user
            const statusSql = 'INSERT INTO online_status (user_id, is_online) VALUES (?, 0)';
            db.run(statusSql, [this.lastID], (statusErr) => {
                if (statusErr) {
                    console.error('Error creating online status:', statusErr);
                    return res.status(500).json({ error: "Error creating user" });
                }
                res.status(201).json({ message: "User created successfully" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role });
    });
};

module.exports = {
    register,
    login
};