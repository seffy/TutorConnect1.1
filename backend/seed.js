const bcrypt = require('bcrypt');
const { db, initializeDatabase } = require('./config/database');

const users = [
    {
        username: 'teacher1',
        password: 'teacher123',
        role: 'teacher'
    },
    {
        username: 'Tutor-Mike',
        password: 'teacher123',
        role: 'teacher'
    },
    {
        username: 'LuisLuit',
        password: 'student123',
        role: 'learner'
    },
    {
        username: 'HarveySpecter',
        password: 'student123',
        role: 'learner'
    }
];

async function seedDatabase() {
    try {
        // Wait for database initialization
        await initializeDatabase(db);
        
        // Clear existing data
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM online_status', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Insert users and their online status
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const result = await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [user.username, hashedPassword, user.role],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });
            
            // Add online status for the user
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO online_status (user_id, is_online) VALUES (?, 0)',
                    [result],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed
seedDatabase();