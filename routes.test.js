const supertest = require('supertest');
const app = require('../app');  // Correct the path as necessary
require('dotenv').config({ path: '.env.test' });  // Ensure this points to a correct test env file

let token;  // Variable to hold token for authenticated requests

describe('API Routes Integration Tests', () => {
    beforeAll(async () => {
        // Register a user and login to get a token if needed
        await supertest(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
                role: 'teacher'
            });

        const response = await supertest(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        token = response.body.token;  // Store the token for future requests
    });

    describe('/api/auth', () => {
        it('should register a new user', async () => {
            const userData = {
                username: 'newuser',
                password: 'password123',
                role: 'teacher'
            };
            await supertest(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('message', 'User created successfully');
                });
        });

        it('should login user', async () => {
            const loginData = {
                username: 'newuser',
                password: 'password123'
            };
            await supertest(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('token');
                });
        });
    });

    describe('/api/slots', () => {
        it('should retrieve all slots', async () => {
            await supertest(app)
                .get('/api/slots')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toBeInstanceOf(Array);
                });
        });
    });

    describe('/api/teachers', () => {
        it('should retrieve all teachers', async () => {
            await supertest(app)
                .get('/api/teachers')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toBeInstanceOf(Array);
                    expect(response.body.every(i => i.role === 'teacher')).toBe(true);
                });
        });
    });
});
