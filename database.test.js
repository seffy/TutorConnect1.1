const chai = require('chai');
const expect = chai.expect;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');  // Using an in-memory database for testing

// Helper function to initialize the database
function initializeDatabase() {
    db.serialize(() => {
        db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)");
        db.run("CREATE TABLE slots (id INTEGER PRIMARY KEY, time_slot TEXT, available INTEGER, user_id INTEGER)");
        db.run("CREATE TABLE online_status (user_id INTEGER PRIMARY KEY, is_online INTEGER, last_seen TEXT)");
    });
}

describe('Database Operations', () => {
    beforeEach((done) => {
        initializeDatabase();
        done();
    });

    afterEach((done) => {
        db.serialize(() => {
            db.run("DELETE FROM users");
            db.run("DELETE FROM slots");
            db.run("DELETE FROM online_status");
        });
        done();
    });

    // Test Case 1: Create user
    it('should insert a new user into the users table', (done) => {
        const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        stmt.run('testuser', 'password123', 'learner', function (err) {
            expect(err).to.be.null;
            expect(this.lastID).to.be.a('number');
            done();
        });
    });

    // Test Case 2: Update user
    it('should update the username of an existing user', (done) => {
        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['testuser', 'password123', 'learner'], function (err) {
            db.run("UPDATE users SET username = ? WHERE id = ?", ['updateduser', this.lastID], function (err) {
                expect(err).to.be.null;
                db.get("SELECT username FROM users WHERE id = ?", [this.lastID], (err, row) => {
                    expect(row.username).to.equal('updateduser');
                    done();
                });
            });
        });
    });

    // Test Case 3: Delete user
    it('should delete a user from the users table', (done) => {
        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['testuser', 'password123', 'learner'], function (err) {
            db.run("DELETE FROM users WHERE id = ?", [this.lastID], function (err) {
                expect(err).to.be.null;
                db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
                    expect(row).to.be.undefined;
                    done();
                });
            });
        });
    });

    // Test Case 4: Create slot
    it('should insert a new slot into the slots table', (done) => {
        const stmt = db.prepare("INSERT INTO slots (time_slot, available, user_id) VALUES (?, ?, ?)");
        stmt.run('10:00 AM', 1, 1, function (err) {
            expect(err).to.be.null;
            expect(this.lastID).to.be.a('number');
            done();
        });
    });

    // Test Case 5: Update slot
    it('should update the availability of a slot', (done) => {
        db.run("INSERT INTO slots (time_slot, available, user_id) VALUES (?, ?, ?)", ['10:00 AM', 1, 1], function (err) {
            db.run("UPDATE slots SET available = ? WHERE id = ?", [0, this.lastID], function (err) {
                expect(err).to.be.null;
                db.get("SELECT available FROM slots WHERE id = ?", [this.lastID], (err, row) => {
                    expect(row.available).to.equal(0);
                    done();
                });
            });
        });
    });

    // Test Case 6: Delete slot
    it('should delete a slot from the slots table', (done) => {
        db.run("INSERT INTO slots (time_slot, available, user_id) VALUES (?, ?, ?)", ['10:00 AM', 1, 1], function (err) {
            db.run("DELETE FROM slots WHERE id = ?", [this.lastID], function (err) {
                expect(err).to.be.null;
                db.get("SELECT * FROM slots WHERE id = ?", [this.lastID], (err, row) => {
                    expect(row).to.be.undefined;
                    done();
                });
            });
        });
    });

    // Test Case 7: Create online status
    it('should insert a new online status into the online_status table', (done) => {
        const stmt = db.prepare("INSERT INTO online_status (user_id, is_online, last_seen) VALUES (?, ?, ?)");
        stmt.run(1, 1, '2025-02-07 10:00:00', function (err) {
            expect(err).to.be.null;
            expect(this.lastID).to.be.a('number');
            done();
        });
    });

    // Test Case 8: Update online status
    it('should update the online status of a user', (done) => {
        db.run("INSERT INTO online_status (user_id, is_online, last_seen) VALUES (?, ?, ?)", [1, 1, '2025-02-07 10:00:00'], function (err) {
            db.run("UPDATE online_status SET is_online = ? WHERE user_id = ?", [0, 1], function (err) {
                expect(err).to.be.null;
                db.get("SELECT is_online FROM online_status WHERE user_id = ?", [1], (err, row) => {
                    expect(row.is_online).to.equal(0);
                    done();
                });
            });
        });
    });

    // Test Case 9: Delete online status
    it('should delete an online status from the online_status table', (done) => {
        db.run("INSERT INTO online_status (user_id, is_online, last_seen) VALUES (?, ?, ?)", [1, 1, '2025-02-07 10:00:00'], function (err) {
            db.run("DELETE FROM online_status WHERE user_id = ?", [1], function (err) {
                expect(err).to.be.null;
                db.get("SELECT * FROM online_status WHERE user_id = ?", [1], (err, row) => {
                    expect(row).to.be.undefined;
                    done();
                });
            });
        });
    });
});
