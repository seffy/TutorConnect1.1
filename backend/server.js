require('dotenv').config();
const app = require('./app');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { db } = require('./config/database');
const wsManager = require('./websocket');

const server = http.createServer(app);
const wss = new WebSocket.Server({ 
    server,
    clientTracking: true 
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'auth' && data.token) {
                const user = jwt.verify(data.token, process.env.JWT_SECRET);
                wsManager.addUser(user.id, ws);
                
                if (user.role === 'teacher') {
                    // Update teacher's online status
                    db.run('UPDATE online_status SET is_online = 1, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?', 
                        [user.id], 
                        (err) => {
                            if (err) console.error('Error updating teacher status:', err);
                            // Broadcast updated status to all connected clients
                            broadcastTeacherStatus();
                        }
                    );
                }
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
        }
    });

    ws.on('close', () => {
        for (const [userId, conn] of wsManager.connectedUsers.entries()) {
            if (conn === ws) {
                wsManager.removeUser(userId);
                
                // Update status when a teacher disconnects
                db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
                    if (err) return console.error('Error checking user role:', err);
                    
                    if (user && user.role === 'teacher') {
                        db.run('UPDATE online_status SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?', 
                            [userId], 
                            (err) => {
                                if (err) console.error('Error updating teacher status:', err);
                                // Broadcast updated status to all clients
                                broadcastTeacherStatus();
                            }
                        );
                    }
                });
                break;
            }
        }
    });
});

// Function to broadcast teacher status to all connected clients
function broadcastTeacherStatus() {
    const sql = `
        SELECT u.id, u.username, 
               COALESCE(os.is_online, 0) as is_online,
               os.last_seen
        FROM users u
        LEFT JOIN online_status os ON u.id = os.user_id
        WHERE u.role = 'teacher'
    `;
    
    db.all(sql, [], (err, teachers) => {
        if (err) {
            console.error('Error fetching teacher status:', err);
            return;
        }
        
        const message = JSON.stringify({
            type: 'teacherStatus',
            teachers: teachers
        });

        wsManager.broadcast(message);
    });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});