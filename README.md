# TutorConnect

**Connecting Peer Tutors and Students**

TutorConnect is a platform designed to connect students who need academic assistance with peer tutors. 

---

## Features

- **Real-Time Tutor Matching**: Students can find available peer tutors in real-time.
- **Post Requests**: Students can post requests for specific subjects or topics.
- **Accept or Reject Tutoring Request**: Peer tutors can create accept or reject tutoring service.
- **Messaging System**: Secure and private communication between students and tutors.
- **User-Friendly Interface**: Intuitive design to make navigation seamless.

---
## Getting Started

For TutorConnect, there are two main Docker containers:

1.	Frontend Container (josephjhonsabana/tutor_connect_frontend)
- Runs on port 3000
- Handles the user interface and all client-side interactions
- Sends requests to the backend to fetch or update data

2.	Backend Container. (josephjhonsabana/tutor_connect_backend)

- Runs on port 8000.
- Manages data processing, business logic, and API requests
- Uses an SQLite database for data storage

How These Containers Work Together
•	The frontend container communicates with the backend container via API requests.
•	The backend container interacts with an SQLite database, which is lightweight and does not require a separate database server.


### Prerequisites
- **Database**: SQLite (Managed via DB Browser for SQLite)
- **Backend**: Node.js with Express.js
- **Security**: JWT Authentication & Bcrypt for password encryption
- **Middleware**: CORS for cross-origin access control



### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/seffy/TutorConnect1.1.git
   ```
2. Navigate to the project directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Start the development server:
   ```bash
   npm start
   ```

---

## Technologies Used

- **Frontend**: HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Real-Time Updates**: Socket.IO
- **Database**: SQLLite
- **Hosting**: (To be determined)

---

## Contribution

To contribute:

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For questions or suggestions, please contact:


TEJAS VITTHALBHAI DEVANI
s224747843@deakin.edu.au

NABEL MOHAMMED
s224854118@deakin.edu.au

JOSEPH JHON APUT SABANA
s224881298@deakin.edu.au

FAISAL IBRAHIM SYED
s224712754@deakin.edu.au

---

Thank you for contributing to TutorConnect! Together, we make learning better.

