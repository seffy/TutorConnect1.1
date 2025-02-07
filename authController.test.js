const supertest = require('supertest');
const app = require('../app'); // Update the path according to your structure
const { db } = require('../config/database');

// Mock db.run and db.get
jest.mock('../config/database', () => {
    const originalModule = jest.requireActual('../config/database');
    return {
        __esModule: true,
        ...originalModule,
        db: {
            ...originalModule.db,
            run: jest.fn(),
            get: jest.fn()
        }
    };
});

describe('Authentication Controller', () => {
    describe('register function', () => {
        it('should handle user already exists error', async () => {
            db.run.mockImplementation((sql, params, callback) => {
                if (sql.includes('INSERT INTO users')) {
                    callback({ message: "UNIQUE constraint failed: users.username" });
                }
            });

            await supertest(app)
                .post('/api/auth/register')
                .send({ username: 'existingUser', password: 'password123', role: 'teacher' })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toEqual("Username already exists");
                });
        });

        it('should successfully register a user', async () => {
            db.run.mockImplementation((sql, params, callback) => {
                if (sql.includes('INSERT INTO users')) {
                    callback(null, { lastID: 1 });
                }
            });

            await supertest(app)
                .post('/api/auth/register')
                .send({ username: 'newUser', password: 'password123', role: 'teacher' })
                .expect(201)
                .then((response) => {
                    expect(response.body.message).toEqual("User created successfully");
                });
        });
    });

    describe('login function', () => {
        it('should handle invalid credentials', async () => {
            db.get.mockImplementation((sql, params, callback) => {
                if (params[0] === 'nonexistentUser') {
                    callback(null, undefined);
                }
            });

            await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistentUser', password: 'password' })
                .expect(401)
                .then((response) => {
                    expect(response.body.error).toEqual("Invalid credentials");
                });
        });

        it('should login successfully with correct credentials', async () => {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('password123', 10);

            db.get.mockImplementation((sql, params, callback) => {
                if (params[0] === 'validUser') {
                    callback(null, { id: 1, username: 'validUser', password: hashedPassword, role: 'teacher' });
                }
            });

            await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'validUser', password: 'password123' })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('token');
                });
        });
    });
});
