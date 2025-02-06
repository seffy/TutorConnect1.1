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
        ws.send(JSON.stringify({
            type: 'auth',
            token: token
        }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'teacherStatus') {
                updateTeachersList(data.teachers);
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Load teacher list with online status
async function loadTeachers() {
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch teachers');
        
        const teachers = await response.json();
        updateTeachersList(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        showError('Failed to load teachers list');
    }
}

// Update teachers list in UI
function updateTeachersList(teachers) {
    const container = document.getElementById('teachers-container');
    if (!container) return;

    container.innerHTML = teachers.map(teacher => `
    <div class="request-card">
			<div class="profile">
              <img src="img/person2.png" alt="Profile Picture">
            <div class="tutorname"><span>${teacher.username}</span><div class="verified"></div>
              <div class="messagedetails">
 <span class="teacher-status ${teacher.is_online ? 'online' : 'offline'}">
                ${teacher.is_online ? 'Online' : 'Offline'}
            </span>
            ${!teacher.is_online && teacher.last_seen ? 
                `<span class="last-seen">Last seen: ${new Date(teacher.last_seen).toLocaleString()}</span>` 
                : ''
            }
			  </div> </div>
          </div>
  	</div>



    `).join('');
}

// Load learner's slots
async function loadMySlots() {
    try {
        const response = await fetch(`${API_URL}/slots`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch slots');

        const slots = await response.json();
        displaySlots(slots);
    } catch (error) {
        console.error('Error loading slots:', error);
        showError('Failed to load slots');
    }
}

// Display slots in UI
function displaySlots(slots) {
    const container = document.getElementById('slots-container');
    if (!container) return;

    try {
        if (!slots.length) {
            container.innerHTML = '<p>No slots created yet</p>';
            return;
        }

        container.innerHTML = slots.map(slot => `
            <div class="session-card">
               <div class="slot-item ${slot.status.toLowerCase()}">
                <p class="subject">Subject: ${slot.subject}</p>
                <div class="req-status">Status: ${slot.status}</p>
                ${slot.teacher_name ? `<p>Teacher: ${slot.teacher_name}</p>` : ''}
                ${slot.status === 'pending' ? 
                    `<button onclick="deleteSlot(${slot.id})">Delete</button>` : 
                    ''
                }
                ${slot.status === 'rejected' ? 
                    `<p class="rejection-note">This slot has been rejected</p>` : 
                    ''
                }
             </div>
            </div>

        `).join('');
    } catch (error) {
        console.error('Error displaying slots:', error);
        container.innerHTML = '<p>Error displaying slots</p>';
    }
}

// function displaySlots(slots) {
//     const container = document.getElementById('slots-container');
//     if (!container) return;

//     try {
//         if (!slots.length) {
//             container.innerHTML = '<p>No slots created yet</p>';
//             return;
//         }

//         container.innerHTML = slots.map(slot => `
//             <div class="slot-item ${slot.status.toLowerCase()}">
//                 <p>Subject: ${slot.subject}</p>
//                 <p>Status: ${slot.status}</p>
//                 ${slot.teacher_name ? `<p>Teacher: ${slot.teacher_name}</p>` : ''}
//                 ${slot.status === 'pending' ? 
//                     `<button onclick="deleteSlot(${slot.id})">Delete</button>` : 
//                     ''
//                 }
//                 ${slot.status === 'accepted' ? 
//                     `<button onclick="joinVideoCall('${slot.meeting_code}')">Connect</button>` : 
//                     ''
//                 }
//             </div>
//         `).join('');
//     } catch (error) {
//         console.error('Error displaying slots:', error);
//         container.innerHTML = '<p>Error displaying slots</p>';
//     }
// }

function displaySlots(slots) {
    const container = document.getElementById('slots-container');
    if (!container) return;

    try {
        if (!slots.length) {
            container.innerHTML = '<p>No slots created yet</p>';
            return;
        }

        container.innerHTML = slots.map(slot => `
              <div class="session-card">
            <div class="slot-item ${slot.status.toLowerCase()}">
                <p>Subject: ${slot.subject}</p>
                <p>Status: ${slot.status}</p>
                ${slot.teacher_name ? `<p>Teacher: ${slot.teacher_name}</p>` : ''}
                ${slot.status === 'accepted' ? 
                    `<p>Meeting Code: ${slot.meeting_code}</p>
                     <button onclick="joinVideoCall('${slot.meeting_code}')">Join Meeting</button>` 
                    : ''
                }
                ${slot.status === 'pending' ? 
                    `<button onclick="deleteSlot(${slot.id})">Delete</button>` 
                    : ''
                }
            </div></div>
        `).join('');
    } catch (error) {
        console.error('Error displaying slots:', error);
        container.innerHTML = '<p>Error displaying slots</p>';
    }
}

// function joinVideoCall(meetingCode) {
//     // Store the meeting code in localStorage
//     localStorage.setItem('meetingCode', meetingCode);
//     localStorage.setItem('userName', 'Learner'); // Or get actual user name
    
//     // Redirect to video chat page
//     window.open('/video-chat.html', '_blank'); //video-chat.html
// }

function joinVideoCall(meetingCode) {
    localStorage.setItem('meetingCode', meetingCode);
    window.open('/video-chat.html', '_blank');
}

// Create new slot
document.getElementById('slot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject').value.trim();

    if (!subject) {
        showError('Please enter a subject');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/slots`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject })
        });

        if (!response.ok) throw new Error('Failed to create slot');
        
        document.getElementById('subject').value = '';
        loadMySlots();
        showSuccess('Slot created successfully');
    } catch (error) {
        console.error('Error creating slot:', error);
        showError('Failed to create slot');
    }
});

// Delete slot
async function deleteSlot(slotId) {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
        const response = await fetch(`${API_URL}/slots/${slotId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete slot');
        loadMySlots();
        showSuccess('Slot deleted successfully');
    } catch (error) {
        console.error('Error deleting slot:', error);
        showError('Failed to delete slot');
    }
}

// Utility functions for showing messages
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.dashboard-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.dashboard-container').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Initialize
connectWebSocket();
loadTeachers();
loadMySlots();