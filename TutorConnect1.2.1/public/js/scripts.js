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
              <div class="tutor-student-card">
                <div class="status status-online">
                  <div class="online-w"></div>
                  <span>${request.status}</span>
                </div>
                <div class="ineedhelp-msg">${request.message}</div>
                 <p class="dateposted"><strong>Date:</strong> ${new Date(request.createdAt).toLocaleString()}</p>

                 <p>&nbsp;</p>
                <div class="profile">
                  <img src="images/person2.png" alt="Profile Picture">
                  <div>
                    
                   
                    <div class="tutorname">
                      ${studentName}
                      <div class="verified"></div>
                    </div>
                    <div class="theurgency"><strong>Urgency:</strong> <div class="urgencystatus">${request.urgency}</div></div>
                  </div>
                </div>
               <p>&nbsp;</p>
                <div class="th-actions">
                  <a href="#">View Profile</a>
                  <a href="#">Message</a>
                  <a href="#">Apply Now!</a>
                </div>
              </div>`;
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