// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database initialization function
function initializeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('teacher', 'learner')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Slots table
            // db.run(`CREATE TABLE IF NOT EXISTS slots (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     subject TEXT NOT NULL,
            //     learner_id INTEGER,
            //     teacher_id INTEGER,
            //     status TEXT DEFAULT 'pending',
            //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            //     FOREIGN KEY (learner_id) REFERENCES users(id),
            //     FOREIGN KEY (teacher_id) REFERENCES users(id)
            // )`);

            db.run(`CREATE TABLE IF NOT EXISTS slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                learner_id INTEGER,
                teacher_id INTEGER,
                status TEXT DEFAULT 'pending',
                meeting_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES users(id),
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            )`);

            // Online Status table
            db.run(`CREATE TABLE IF NOT EXISTS online_status (
                user_id INTEGER PRIMARY KEY,
                is_online BOOLEAN DEFAULT 0,
                last_seen TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        // Initialize database
        initializeDatabase(db).then(() => {
            console.log('Database initialized successfully');
        }).catch(error => {
            console.error('Database initialization error:', error);
        });
    }
});

module.exports = { db, initializeDatabase };