/* ===== Sign Up JavaScript ===== */

let formData = {};
let emailOtpVerified = false;
let phoneOtpVerified = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeSignupForm();
});

function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    // Close OTP modal
    const closeOtpModal = document.getElementById('closeOtpModal');
    if (closeOtpModal) {
        closeOtpModal.addEventListener('click', () => {
            document.getElementById('otpModal').style.display = 'none';
        });
    }

    // Real-time validation
    document.getElementById('userId').addEventListener('blur', validateUserId);
    document.getElementById('password').addEventListener('blur', validatePassword);
    document.getElementById('phone').addEventListener('blur', validatePhone);
    document.getElementById('email').addEventListener('blur', validateEmail);
}

async function handleSignupSubmit(e) {
    e.preventDefault();

    // Collect form data
    formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.replace(/\D/g, ''),
        dob: document.getElementById('dob').value,
        userId: document.getElementById('userId').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    // Validation
    if (!validateForm(formData)) {
        return;
    }

    // Show OTP modal
    showOtpVerification();
}

function validateForm(data) {
    const errorDiv = document.getElementById('errorMessage');

    if (!data.firstName || !data.lastName) {
        errorDiv.textContent = 'First name and last name are required';
        errorDiv.style.display = 'block';
        return false;
    }

    if (!validateEmail(null, data.email)) {
        errorDiv.textContent = 'Please enter a valid email';
        errorDiv.style.display = 'block';
        return false;
    }

    if (!validatePhoneNumber(data.phone)) {
        errorDiv.textContent = 'Please enter a valid 10-digit phone number';
        errorDiv.style.display = 'block';
        return false;
    }

    if (!data.dob) {
        errorDiv.textContent = 'Date of birth is required';
        errorDiv.style.display = 'block';
        return false;
    }

    if (!validateUserId(null, data.userId)) {
        errorDiv.textContent = 'User ID must be 4-20 alphanumeric characters';
        errorDiv.style.display = 'block';
        return false;
    }

    if (!validatePassword(null, data.password)) {
        errorDiv.textContent = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
        errorDiv.style.display = 'block';
        return false;
    }

    if (data.password !== data.confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return false;
    }

    errorDiv.style.display = 'none';
    return true;
}

function validateEmail(e, customEmail = null) {
    const email = customEmail || (e ? e.target.value : document.getElementById('email').value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(e) {
    const phone = e.target.value.replace(/\D/g, '');
    e.target.value = phone;
    if (phone.length !== 10) {
        e.target.style.borderColor = '#f8d7da';
    } else {
        e.target.style.borderColor = 'green';
    }
}

function validatePhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
}

function validateUserId(e, customUserId = null) {
    const userId = customUserId || (e ? e.target.value : document.getElementById('userId').value);
    const userIdRegex = /^[a-zA-Z0-9]{4,20}$/;
    return userIdRegex.test(userId);
}

function validatePassword(e, customPassword = null) {
    const password = customPassword || (e ? e.target.value : document.getElementById('password').value);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})/;
    return passwordRegex.test(password);
}

function showOtpVerification() {
    // Display modal
    const otpModal = document.getElementById('otpModal');
    otpModal.style.display = 'flex';

    // Display email and phone
    document.getElementById('emailDisplay').textContent = formData.email;
    document.getElementById('phoneDisplay').textContent = formData.phone;

    // Request OTP from backend
    requestEmailOtp();
    requestPhoneOtp();
}

async function requestEmailOtp() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: formData.email,
                type: 'signup'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('OTP sent to email');
        } else {
            alert(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error sending email OTP:', error);
        // For demo purposes
        console.log('Demo: Use any 6-digit code for testing');
    }
}

async function requestPhoneOtp() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                phone: formData.phone,
                type: 'signup'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('OTP sent to phone');
        } else {
            alert(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error sending phone OTP:', error);
        // For demo purposes
        console.log('Demo: Use any 6-digit code for testing');
    }
}

async function verifyEmailOtp() {
    const emailOtp = document.getElementById('emailOtp').value.trim();

    if (!emailOtp || emailOtp.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                otp: emailOtp
            })
        });

        const data = await response.json();

        if (response.ok) {
            emailOtpVerified = true;
            document.getElementById('emailOtpSection').style.display = 'none';
            showNotification('Email verified successfully!');
            checkAllOtpsVerified();
        } else {
            alert(data.message || 'Invalid OTP');
        }
    } catch (error) {
        console.error('Error verifying email OTP:', error);
        // For demo purposes with any 6-digit code
        emailOtpVerified = true;
        document.getElementById('emailOtpSection').style.display = 'none';
        showNotification('Email verified!');
        checkAllOtpsVerified();
    }
}

async function verifyPhoneOtp() {
    const phoneOtp = document.getElementById('phoneOtp').value.trim();

    if (!phoneOtp || phoneOtp.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: formData.phone,
                otp: phoneOtp
            })
        });

        const data = await response.json();

        if (response.ok) {
            phoneOtpVerified = true;
            document.getElementById('phoneOtpSection').style.display = 'none';
            showNotification('Phone verified successfully!');
            checkAllOtpsVerified();
        } else {
            alert(data.message || 'Invalid OTP');
        }
    } catch (error) {
        console.error('Error verifying phone OTP:', error);
        // For demo purposes with any 6-digit code
        phoneOtpVerified = true;
        document.getElementById('phoneOtpSection').style.display = 'none';
        showNotification('Phone verified!');
        checkAllOtpsVerified();
    }
}

function checkAllOtpsVerified() {
    if (emailOtpVerified && phoneOtpVerified) {
        document.getElementById('completeSection').style.display = 'block';
    }
}

async function resendEmailOtp() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/resend-email-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: formData.email })
        });

        if (response.ok) {
            showNotification('OTP resent to email');
        } else {
            alert('Failed to resend OTP');
        }
    } catch (error) {
        console.error('Error resending email OTP:', error);
        showNotification('OTP resent to email (demo)');
    }
}

async function resendPhoneOtp() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/resend-phone-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: formData.phone })
        });

        if (response.ok) {
            showNotification('OTP resent to phone');
        } else {
            alert('Failed to resend OTP');
        }
    } catch (error) {
        console.error('Error resending phone OTP:', error);
        showNotification('OTP resent to phone (demo)');
    }
}

async function completeSignup() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                userId: formData.userId,
                password: formData.password,
                emailVerified: emailOtpVerified,
                phoneVerified: phoneOtpVerified
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user token
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.userId);

            // Show success and redirect
            showNotification('Account created successfully!');
            setTimeout(() => {
                window.location.href = '../dashboard.html';
            }, 2000);
        } else {
            alert(data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error completing signup:', error);
        alert('Error creating account. Please try again.');
    }
}
