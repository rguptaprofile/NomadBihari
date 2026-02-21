/* ===== Main JavaScript ===== */

// API Base URL - Update this based on your backend server
const API_BASE_URL = 'http://localhost:5000/api';
// Make it globally available
window.API_BASE_URL = API_BASE_URL;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Show privacy policy modal only once per session
    if (!sessionStorage.getItem('policyAccepted')) {
        showPolicyModal();
    }

    // Initialize contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Check user authentication
    checkUserAuthentication();
}

// ===== Policy Modal Functions =====
function showPolicyModal() {
    const policyModal = document.getElementById('policyModal');
    if (policyModal) {
        policyModal.style.display = 'flex';
    }
}

function closePolicyModal() {
    const policyModal = document.getElementById('policyModal');
    if (policyModal) {
        policyModal.style.display = 'none';
    }
}

// Accept policy button
const acceptPolicyBtn = document.getElementById('acceptPolicy');
if (acceptPolicyBtn) {
    acceptPolicyBtn.addEventListener('click', function() {
        sessionStorage.setItem('policyAccepted', 'true');
        closePolicyModal();
    });
}

// Close policy button
const closePolicyBtn = document.getElementById('closePolicy');
if (closePolicyBtn) {
    closePolicyBtn.addEventListener('click', closePolicyModal);
}

// ===== Contact Form Handling =====
async function handleContactForm(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    // Validation
    if (!name || !email || !subject || !message) {
        alert('Please fill in all required fields');
        return;
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid email');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/contact/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, subject, message })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Message sent successfully! We will get back to you soon.');
            document.getElementById('contactForm').reset();
        } else {
            alert(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again later.');
    }
}

// ===== Authentication Functions =====
function checkUserAuthentication() {
    const token = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');

    // Update navigation based on login status
    const navLinks = document.querySelectorAll('.nav-link');
    const signUpLink = Array.from(navLinks).find(link => link.textContent === 'Sign Up');
    const signInLink = Array.from(navLinks).find(link => link.textContent === 'Sign In');

    if (token || adminToken) {
        if (signUpLink) signUpLink.style.display = 'none';
        if (signInLink) signInLink.style.display = 'none';
    } else {
        if (signUpLink) signUpLink.style.display = 'inline-block';
        if (signInLink) signInLink.style.display = 'inline-block';
    }
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    window.location.href = '/index.html';
}

// ===== Utility Functions =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10}$/; // Simple 10 digit validation for India
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function validatePassword(password) {
    // Password must be at least 8 characters with uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})/;
    return passwordRegex.test(password);
}

// Parse URL parameters
function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + 'y ago';

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + 'm ago';

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + 'd ago';

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + 'h ago';

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + 'min ago';

    return Math.floor(seconds) + 's ago';
}

// Show notification with message
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.textContent = message;
    notification.style.display = 'block';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== Real-time Updates =====
class RealtimeManager {
    constructor() {
        this.listeners = {};
    }

    subscribe(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(data));
        }
    }

    unsubscribe(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
        }
    }
}

// Global realtime manager instance
const realtimeManager = new RealtimeManager();

// Initialize WebSocket or Server-Sent Events if backend is running
function initializeRealtimeConnection() {
    // This will be implemented with WebSocket or Server-Sent Events
    // depending on your backend infrastructure
    console.log('Realtime connection initialized');
}

// ===== Scroll to Top Button =====
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        font-size: 24px;
        z-index: 997;
        transition: 0.3s;
    `;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });

    button.addEventListener('click', function() {
        window.scrollTo(0, 0);
    });

    document.body.appendChild(button);
}

// Initialize scroll to top button
createScrollToTopButton();

// ===== Service Worker Registration for PWA =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('Service Worker registered successfully:', registration);
    }).catch(function(error) {
        console.log('Service Worker registration failed:', error);
    });
}
