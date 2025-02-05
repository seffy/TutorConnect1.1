// teacher.js
// const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
let ws;

// Redirect if not logged in
if (!token) {
    window.location.href = 'index.html';
}

// WebSocket Connection
function connectWebSocket() {
    ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        if (token) {
            ws.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'slotUpdate') {
            loadAvailableSlots();
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(connectWebSocket, 3000);
    };
}

// Load available slots
async function loadAvailableSlots() {
    try {
        const response = await fetch(`${API_URL}/slots`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const slots = await response.json();
        displaySlots(slots);
    } catch (error) {
        console.error('Error loading slots:', error);
    }
}

// Display slots in UI
function displaySlots(slots) {
    const container = document.getElementById('slots-container');
    container.innerHTML = slots.map(slot => `
        <div class="slot-item">
            <p>Subject: ${slot.subject}</p>
            <p>Learner: ${slot.learner_name}</p>
            <p>Status: ${slot.status}</p>
            ${slot.status === 'pending' ? `
                <div class="slot-actions">
                    <button onclick="acceptSlot(${slot.id})">Accept</button>
                    <button onclick="rejectSlot(${slot.id})">Reject</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Accept slot
async function acceptSlot(slotId) {
    try {
        const response = await fetch(`${API_URL}/slots/${slotId}/accept`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to accept slot');
        loadAvailableSlots();
    } catch (error) {
        console.error('Error accepting slot:', error);
        alert('Failed to accept slot');
    }
}

// Delete slot
async function rejectSlot(slotId) {
    try {
        const response = await fetch(`${API_URL}/slots/${slotId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reject slot');
        
        // Refresh the slots list after rejection
        loadAvailableSlots();
    } catch (error) {
        console.error('Error rejecting slot:', error);
        alert('Failed to reject slot');
    }
}

// Initialize
connectWebSocket();
loadAvailableSlots();

// Refresh slots periodically
setInterval(loadAvailableSlots, 30000);