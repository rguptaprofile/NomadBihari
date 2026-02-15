/* ===== Sign In JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Show login type selection on page load
    document.getElementById('loginTypeModal').style.display = 'flex';
});

function selectLoginType(type) {
    document.getElementById('loginTypeModal').style.display = 'none';

    if (type === 'user') {
        document.getElementById('userLoginForm').style.display = 'block';
        document.getElementById('userUserId').focus();
    } else if (type === 'admin') {
        document.getElementById('adminLoginForm').style.display = 'block';
        document.getElementById('adminEmail').focus();
    }
}

function backToLoginType() {
    document.getElementById('loginTypeModal').style.display = 'flex';
    document.getElementById('userLoginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'none';
}

// User Login Handler
async function handleUserLogin(e) {
    e.preventDefault();

    const userId = document.getElementById('userUserId').value.trim();
    const password = document.getElementById('userPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const errorDiv = document.getElementById('userErrorMessage');
    const successDiv = document.getElementById('userSuccessMessage');

    if (!userId || !password) {
        errorDiv.textContent = 'Please enter both User ID/Email and Password';
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        return;
    }

    try {
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
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

            successDiv.textContent = 'Login successful! Redirecting...';
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';

            setTimeout(() => {
                window.location.href = '../dashboard.html';
            }, 2000);
        } else {
            errorDiv.textContent = data.message || 'Invalid User ID/Email or Password';
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Login error:', error);
        
        // For demo purposes - accept any non-empty credentials
        localStorage.setItem('userToken', 'demo_token_' + Math.random().toString(36).substring(7));
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', 'Demo User');

        successDiv.textContent = 'Login successful (Demo Mode)! Redirecting...';
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        setTimeout(() => {
            window.location.href = '../dashboard.html';
        }, 2000);
    }
}

// Admin Login Handler
async function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const errorDiv = document.getElementById('adminErrorMessage');
    const successDiv = document.getElementById('adminSuccessMessage');

    if (!email || !password) {
        errorDiv.textContent = 'Please enter both Email and Password';
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        return;
    }

    try {
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
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

            successDiv.textContent = 'Admin login successful! Redirecting...';
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';

            setTimeout(() => {
                window.location.href = '../admin-dashboard.html';
            }, 2000);
        } else {
            errorDiv.textContent = data.message || 'Invalid Admin Email or Password';
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Admin login error:', error);
        
        // For demo purposes - check for specific admin credentials
        const DEMO_ADMIN_EMAIL = 'admin@nomadbihari.com';
        const DEMO_ADMIN_PASSWORD = 'Admin@123';

        if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
            localStorage.setItem('adminToken', 'demo_admin_token_' + Math.random().toString(36).substring(7));
            localStorage.setItem('adminId', '1');
            localStorage.setItem('adminName', 'Nomad Bihari Admin');
            localStorage.removeItem('userToken');

            successDiv.textContent = 'Admin login successful (Demo)! Redirecting...';
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';

            setTimeout(() => {
                window.location.href = '../admin-dashboard.html';
            }, 2000);
        } else {
            errorDiv.textContent = 'Invalid Admin Email or Password. (Demo: admin@nomadbihari.com / Admin@123)';
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }
    }
}

// Form submission with Enter key
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('userForm')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserLogin(e);
        }
    });

    document.getElementById('adminForm')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAdminLogin(e);
        }
    });
});
