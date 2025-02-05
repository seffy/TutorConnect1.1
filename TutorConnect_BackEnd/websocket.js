class WebSocketManager {
    constructor() {
        this.connectedUsers = new Map();
    }

    addUser(userId, ws) {
        this.connectedUsers.set(userId, ws);
    }

    removeUser(userId) {
        this.connectedUsers.delete(userId);
    }

    getConnection(userId) {
        return this.connectedUsers.get(userId);
    }

    broadcast(message) {
        this.connectedUsers.forEach(ws => {
            ws.send(message);
        });
    }
}

const wsManager = new WebSocketManager();
module.exports = wsManager;