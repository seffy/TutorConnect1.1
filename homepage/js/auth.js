// auth.js
// const API_URL = 'http://localhost:3000/api';

// Handle login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // Store token and role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirect based on role
        window.location.href = `${data.role}-dashboard.html`;
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    }
});

// Handle registration
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        alert('Registration successful! Please login.');
        window.location.href = 'index.html';
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    }
});

// Handle logout
document.getElementById('logout')?.addEventListener('click', () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Close WebSocket connection if exists
    if (window.ws) {
        window.ws.close();
    }
    
    // Redirect to login page
    window.location.href = 'index.html';
});