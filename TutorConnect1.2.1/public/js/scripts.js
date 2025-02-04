document.addEventListener('DOMContentLoaded', () => {
    // Fetch the user's name from the server
    fetch('/api/user-info')
      .then(response => response.json())
      .then(data => {
        // Select all elements with class "name"
        document.querySelectorAll('.name').forEach(element => {
          element.textContent = data.fullName || 'User';
        });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  });



  document.addEventListener('DOMContentLoaded', () => {
    // Fetch the recent request message
    fetch('/api/recent-request')
      .then(response => response.json())
      .then(data => {
        document.getElementById('requestmessage').textContent = data.message;
        document.getElementById('urgencystatus').textContent = data.urgency;
        document.getElementById('requeststatus').textContent = data.status;
        document.getElementById('requestdate').textContent = data.date;
      })
      .catch(error => {
        console.error('Error fetching recent request:', error);
        document.getElementById('requestmessage').textContent = 'Error loading recent request.';
        document.getElementById('urgencystatus').textContent = 'Error loading urgency.';
        document.getElementById('requeststatus').textContent = 'Error loading status.';
        document.getElementById('requestdate').textContent = 'Error loading date.';
      });
  });


  //TutorPage Requests list
  
  document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/recent-requests')
      .then(response => response.json())
      .then(async data => {
        const requestsList = document.getElementById('requestsList');
        requestsList.innerHTML = ""; // Clear previous content
  
        if (data.length === 0) {
          requestsList.innerHTML = "<p>No open requests available.</p>";
          return;
        }
  
        for (const request of data) {
          try {
            // Fetch student full name from the API
            const studentResponse = await fetch(`/api/student-info?email=${request.studentID}`);
            const studentData = await studentResponse.json();
            const studentName = studentData.fullName || request.studentID;
  
            const requestItem = document.createElement("div");
            requestItem.classList.add("request-item");
            requestItem.innerHTML = `
            	<div class="request-card">
       <div class="requestdetails"><strong>Request details:</strong></div> 
       <div class="ineedhelp-msg">${request.message}</div>
			<div class="profile">
              <img src="images/person2.png" alt="Profile Picture">
           
            <div class="tutorname">${studentName}<div class="verified"></div>
              <div class="messagedetails">
				  <p><strong>Urgency:</strong> ${request.urgency}</p>
				  <p><strong>Status:</strong> ${request.status}</p>
				  <p><strong>Date:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
			  </div> </div>
		
          </div>
          	  <div class="btn bg-gray5">Apply</div>
  	</div> `;
            requestsList.appendChild(requestItem);
          } catch (error) {
            console.error('Error fetching student info:', error);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching requests:', error);
        document.getElementById('requestsList').innerHTML = "<p>Error loading requests.</p>";
      });
  });

  



  

//Student Requests
  document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/recent-requests')
      .then(response => response.json())
      .then(data => {
        const myRequestsList = document.getElementById('myrequestsList');
        myRequestsList.innerHTML = ""; // Clear previous content
  
        if (data.length === 0) {
          myRequestsList.innerHTML = "<p>No requests found.</p>";
          return;
        }
  
        data.forEach(request => {
          const requestItem = document.createElement("div");
          requestItem.classList.add("request-item");
          requestItem.innerHTML = `
            <div class="request-card">
              <div><strong>Request details:</strong></div> 
              <div class="message">${request.message}</div>
              <div class="messagedetails">
              <p><strong>Urgency:</strong> ${request.urgency}</p>
              <p><strong>Status:</strong> ${request.status}</p>
              <p><strong>Date:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
              </div>
               <div class="btn bg-gray3">View Applicant(s)</div>
              </div>
            </div> 
          `;
          myRequestsList.appendChild(requestItem);
        });
      })
      .catch(error => {
        console.error('Error fetching user requests:', error);
        document.getElementById('myrequestsList').innerHTML = "<p>Error loading your requests.</p>";
      });
  });


//Add Session

  document.getElementById('sessionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        topicTitle: document.getElementById('topic-title').value,
        date: document.getElementById('date').value,
        timeStart: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        status: document.getElementById('topicstatus').value
    };

    fetch('/api/add-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Session added successfully!');
            window.location.href = '/tutorhomepage';
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding session:', error);
        alert('Error adding session. Please try again.');
    });
});

// Load Sessions 

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/sessions')
    .then(response => response.json())
    .then(data => {
      const sessionsList = document.getElementById('tutorsessions');
      sessionsList.innerHTML = ""; // Clear previous content

      if (data.length === 0) {
        sessionsList.innerHTML = "<p>No sessions found.</p>";
        return;
      }

      data.forEach(session => {
        const sessionItem = document.createElement("div");
        sessionItem.classList.add("session-item");
        sessionItem.innerHTML = `
          <div class="session-card">
            
            <p><strong>Topic:</strong> ${session.topicTitle}</p>
             <div class="messagedetails">
             <p><strong>Session ID:</strong> ${session.sessionID}</p>
            <p><strong>Date:</strong> ${new Date(session.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${session.timeStart} - ${session.endStart}</p>
            <p><strong>Status:</strong> ${session.status}</p>
            </div>
          </div>
      
        `;
        sessionsList.appendChild(sessionItem);
      });
    })
    .catch(error => {
      console.error('Error fetching tutor sessions:', error);
      document.getElementById('tutorsessions').innerHTML = "<p>Error loading your sessions.</p>";
    });
});


