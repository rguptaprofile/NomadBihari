/* ===== Sign In JavaScript ===== */

// API Base URL - Fallback if main.js not loaded
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab switching
    initializeTabSwitching();
    
    // Initialize form submissions
    initializeFormSubmissions();
    
    // Show user login form by default
    document.getElementById('userLoginForm').classList.add('active');
});

function initializeTabSwitching() {
    const userTab = document.getElementById('userTab');
    const adminTab = document.getElementById('adminTab');
    const userLoginForm = document.getElementById('userLoginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (userTab) {
        userTab.addEventListener('click', function(e) {
            e.preventDefault();
            userTab.classList.add('active');
            adminTab.classList.remove('active');
            userLoginForm.classList.add('active');
            adminLoginForm.classList.remove('active');
        });
    }

    if (adminTab) {
        adminTab.addEventListener('click', function(e) {
            e.preventDefault();
            adminTab.classList.add('active');
            userTab.classList.remove('active');
            adminLoginForm.classList.add('active');
            userLoginForm.classList.remove('active');
        });
    }
}

function initializeFormSubmissions() {
    const userForm = document.getElementById('userForm');
    const adminForm = document.getElementById('adminForm');

    if (userForm) {
        userForm.addEventListener('submit', handleUserLogin);
    }

    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
}

// User Login Handler
async function handleUserLogin(e) {
    e.preventDefault();

    const userId = document.getElementById('userIdOrEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const errorDiv = document.getElementById('authMessage');

    if (!userId || !password) {
        showAuthMessage('Please enter both Username/Email and Password', 'error');
        return;
    }

    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/auth/user-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userIdOrEmail: userId,
                password: password,
                rememberMe: rememberMe
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user session
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.firstName + ' ' + data.lastName);
            localStorage.setItem('userEmail', data.email);
            localStorage.removeItem('adminToken');

            showAuthMessage('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../dashboard.html?auth=user';
            }, 1000);
        } else {
            showAuthMessage(data.message || 'Invalid Username/Email or Password', 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Login error:', error);
        
        // For demo purposes - check for demo credentials
        if (userId === 'demo' && password === 'demo123') {
            localStorage.setItem('userToken', 'demo_token_' + Math.random().toString(36).substring(7));
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', 'Demo User');
            localStorage.setItem('userEmail', 'demo@nomadbihari.com');
            localStorage.removeItem('adminToken');

            showAuthMessage('Demo login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../dashboard.html?auth=user';
            }, 1000);
        } else {
            showAuthMessage('Error logging in. Please try again.', 'error');
        }
    }
}

// Admin Login Handler
async function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showAuthMessage('Please enter both Email and Password', 'error');
        return;
    }

    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save admin session
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminId', data.adminId);
            localStorage.setItem('adminName', data.adminName);
            localStorage.removeItem('userToken');

            showAuthMessage('Admin login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../admin-dashboard.html?auth=admin';
            }, 1000);
        } else {
            showAuthMessage(data.message || 'Invalid Admin Email or Password', 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Admin login error:', error);
        
        // For demo purposes - check for specific admin credentials
        const ADMIN_CREDENTIALS = [
            { email: 'gupta.rahul.hru@gmail.com', password: 'Admin1-9525.com', name: 'Rahul Gupta' },
            { email: 'kumarravi69600@gmail.com', password: 'Chudail@143', name: 'Ravi Kumar' }
        ];

        const adminFound = ADMIN_CREDENTIALS.find(a => a.email === email && a.password === password);
        
        if (adminFound) {
            localStorage.setItem('adminToken', 'admin_token_' + Math.random().toString(36).substring(7));
            localStorage.setItem('adminId', '1');
            localStorage.setItem('adminName', adminFound.name);
            localStorage.removeItem('userToken');

            showAuthMessage('Admin login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '../admin-dashboard.html?auth=admin';
            }, 1000);
        } else {
            showAuthMessage('Invalid Admin Email or Password', 'error');
        }
    }
}

function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
}

// Password Toggle Functionality
const toggleUserPassword = document.getElementById('toggleUserPassword');
if (toggleUserPassword) {
    toggleUserPassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('userPassword');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

const toggleAdminPassword = document.getElementById('toggleAdminPassword');
if (toggleAdminPassword) {
    toggleAdminPassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('adminPassword');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}
