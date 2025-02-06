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
// function displaySlots(slots) {
//     const container = document.getElementById('slots-container');
//     container.innerHTML = slots.map(slot => `
//         <div class="slot-item">
//             <p>Subject: ${slot.subject}</p>
//             <p>Learner: ${slot.learner_name}</p>
//             <p>Status: ${slot.status}</p>
//             ${slot.status === 'pending' ? `
//                 <div class="slot-actions">
//                     <button onclick="acceptSlot(${slot.id})">Accept</button>
//                     <button onclick="rejectSlot(${slot.id})">Reject</button>
//                 </div>
//             ` : ''}
//         </div>
//     `).join('');
// }

// function displaySlots(slots) {
//     const container = document.getElementById('slots-container');
//     container.innerHTML = slots.map(slot => `
//         <div class="slot-item">
//             <p>Subject: ${slot.subject}</p>
//             <p>Learner: ${slot.learner_name}</p>
//             <p>Status: ${slot.slot_status}</p>
//             ${slot.slot_status === 'pending' ? `
//                 <div class="slot-actions">
//                     <button onclick="acceptSlot(${slot.id})">Accept</button>
//                     <button onclick="rejectSlot(${slot.id})">Reject</button>
//                 </div>
//             ` : ''}
//             ${slot.slot_status === 'accepted' ? `
//                 <button onclick="joinVideoCall('${slot.meeting_code}')">Connect</button>
//             ` : ''}
//         </div>
//     `).join('');
// }

function displaySlots(slots) {
    const container = document.getElementById('slots-container');
    container.innerHTML = slots.map(slot => `
        <div class="request-card">
        <div class="ineedhelp-msg">${slot.subject}</div>
			<div class="profile">

              <img src="img/person2.png" alt="Profile Picture">
            <div class="tutorname"><span>${slot.learner_name}</span><div class="verified"></div>
              <div class="messagedetails">

 <p>Status: ${slot.slot_status}</p>
           
			  </div> </div>
          </div>
            <div>
 ${slot.slot_status === 'pending' ? `
                <div class="slot-actions">
                    <button class="" onclick="handleAccept(${slot.id})">Accept</button>
                    <button class="bg-grey2" onclick="rejectSlot(${slot.id})">Reject</button>
                    <div id="code-input-${slot.id}" style="display: none; margin-top: 10px;">
                        <input type="text" placeholder="Paste meeting code" id="meeting-code-${slot.id}">
                        <button onclick="submitCode(${slot.id})">Submit Code</button>
                    </div>
                </div>
            ` : ''}
          
				 
            </div>


          <div class="meetingcode">
            ${slot.slot_status === 'accepted' ? `
                <p>Meeting Code:</p>
                <p class="meetingcodecode">${slot.meeting_code || 'Not set'}</p>
            ` : ''}
          </div>

  	</div>
    `).join('');
}

// Track and accept slot code from teacher, saving to db below

function handleAccept(slotId) {
    // First open video chat in new tab
    window.open('/video-chat.html', '_blank');
    
    // Show code input field
    document.getElementById(`code-input-${slotId}`).style.display = 'block';
}

async function submitCode(slotId) {
    const meetingCode = document.getElementById(`meeting-code-${slotId}`).value;
    if (!meetingCode) {
        alert('Please paste a meeting code');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/slots/${slotId}/accept`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ meeting_code: meetingCode })
        });

        if (!response.ok) throw new Error('Failed to submit code');
        loadAvailableSlots(); // Refresh the display
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit code');
    }
}

// function joinVideoCall(meetingCode) {
//     localStorage.setItem('meetingCode', meetingCode);
//     localStorage.setItem('userName', 'Teacher'); // Or get actual teacher name
//     window.location.href = '/video-chat.html';
// }

function joinVideoCall(meetingCode) {
    localStorage.setItem('meetingCode', meetingCode);
    window.open('/video-chat.html', '_blank');
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