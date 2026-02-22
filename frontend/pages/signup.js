/* ===== Sign Up JavaScript (Automatic Registration) ===== */

// API Base URL - Fallback if main.js not loaded
const API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:3000/api';

let emailOtpTarget = '';
let phoneOtpTarget = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeSignupForm();

    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('google')) {
                window.location.href = `${API_BASE_URL}/auth/google`;
            } else if (this.classList.contains('facebook')) {
                window.location.href = `${API_BASE_URL}/auth/facebook`;
            } else if (this.classList.contains('linkedin')) {
                window.location.href = `${API_BASE_URL}/auth/linkedin`;
            }
        });
    });
});

function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }

    const sendEmailOtpBtn = document.getElementById('sendEmailOtp');
    const sendPhoneOtpBtn = document.getElementById('sendPhoneOtp');

    if (sendEmailOtpBtn) sendEmailOtpBtn.addEventListener('click', handleSendEmailOtp);
    if (sendPhoneOtpBtn) sendPhoneOtpBtn.addEventListener('click', handleSendPhoneOtp);

    // Real-time validation
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    
    if (emailInput) emailInput.addEventListener('blur', validateEmailField);
    if (phoneInput) phoneInput.addEventListener('blur', validatePhoneField);
    if (dobInput) dobInput.addEventListener('blur', validateDobField);
}

function normalizePhoneTarget(rawPhone) {
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91${digits}`;
    }
    if (rawPhone.startsWith('+')) {
        return rawPhone;
    }
    return digits;
}

function setOtpStatus(elementId, message, isError) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? '#e74c3c' : '#28a745';
}

async function handleSendEmailOtp() {
    const email = document.getElementById('email').value.trim();
    if (!email) {
        setOtpStatus('emailOtpStatus', 'Please enter email first.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (response.ok) {
            emailOtpTarget = email;
            const demoText = data.demo_otp ? ` Demo OTP: ${data.demo_otp}` : '';
            setOtpStatus('emailOtpStatus', `OTP sent to email.${demoText}`, false);
        } else {
            setOtpStatus('emailOtpStatus', data.message || 'Failed to send email OTP.', true);
        }
    } catch (error) {
        console.error('Email OTP error:', error);
        setOtpStatus('emailOtpStatus', 'Error sending email OTP.', true);
    }
}

async function handleSendPhoneOtp() {
    const phoneRaw = document.getElementById('phone').value.trim();
    if (!phoneRaw) {
        setOtpStatus('phoneOtpStatus', 'Please enter phone first.', true);
        return;
    }

    const phoneTarget = normalizePhoneTarget(phoneRaw);
    if (!phoneTarget || phoneTarget.replace(/\D/g, '').length < 10) {
        setOtpStatus('phoneOtpStatus', 'Please enter a valid phone number.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneTarget })
        });
        const data = await response.json();

        if (response.ok) {
            phoneOtpTarget = phoneTarget;
            const demoText = data.demo_otp ? ` Demo OTP: ${data.demo_otp}` : '';
            setOtpStatus('phoneOtpStatus', `OTP sent to phone.${demoText}`, false);
        } else {
            setOtpStatus('phoneOtpStatus', data.message || 'Failed to send phone OTP.', true);
        }
    } catch (error) {
        console.error('Phone OTP error:', error);
        setOtpStatus('phoneOtpStatus', 'Error sending phone OTP.', true);
    }
}

async function verifyOtp(type, target, otp) {
    const endpoint = type === 'email' ? 'verify-email-otp' : 'verify-phone-otp';
    const payload = type === 'email' ? { email: target, otp } : { phone: target, otp };
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

// Validate email format
function validateEmailField(e) {
    const email = e.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(e.target, 'कृपया एक वैध ईमेल दर्ज करें (Please enter a valid email)');
    } else {
        clearFieldError(e.target);
    }
}

// Validate phone format
function validatePhoneField(e) {
    const phone = e.target.value.replace(/\D/g, '');
    
    if (phone && phone.length !== 10) {
        showFieldError(e.target, 'कृपया 10-अंकीय फोन नंबर दर्ज करें (Please enter a 10-digit phone)');
    } else {
        clearFieldError(e.target);
    }
}

// Validate age (must be 13+)
function validateDobField(e) {
    const dob = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    if (age < 13) {
        showFieldError(e.target, 'आपकी आयु कम से कम 13 वर्ष होनी चाहिए (You must be at least 13 years old)');
    } else {
        clearFieldError(e.target);
    }
}

function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    let error = field.parentElement.querySelector('.field-error');
    if (!error) {
        error = document.createElement('small');
        error.className = 'field-error';
        error.style.color = '#e74c3c';
        error.style.display = 'block';
        field.parentElement.appendChild(error);
    }
    error.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '';
    let error = field.parentElement.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

// Main signup handler
async function handleSignupSubmit(e) {
    e.preventDefault();

    // Collect form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const dob = document.getElementById('dob').value;
    const terms = document.getElementById('terms').checked;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dob) {
        showAuthMessage('कृपया सभी फील्ड भरें (Please fill in all required fields)', 'error');
        return;
    }

    // Validate terms
    if (!terms) {
        showAuthMessage('कृपया नियम और शर्तें स्वीकार करें (Please accept Terms & Conditions)', 'error');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthMessage('कृपया एक वैध ईमेल दर्ज करें (Please enter a valid email)', 'error');
        return;
    }

    // Validate phone
    if (phone.length !== 10) {
        showAuthMessage('कृपया 10-अंकीय फोन नंबर दर्ज करें (Please enter a 10-digit phone)', 'error');
        return;
    }

    // Validate age
    const dob_date = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dob_date.getFullYear();
    const monthDiff = today.getMonth() - dob_date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob_date.getDate())) {
        age--;
    }
    
    if (age < 13) {
        showAuthMessage('आपकी आयु कम से कम 13 वर्ष होनी चाहिए (You must be at least 13 years old)', 'error');
        return;
    }

    const emailOtp = document.getElementById('emailOtp').value.trim();
    const phoneOtp = document.getElementById('phoneOtp').value.trim();

    if (!emailOtp || !phoneOtp) {
        showAuthMessage('कृपया Email और Phone OTP भरें (Please enter both OTPs)', 'error');
        return;
    }

    if (!emailOtpTarget || emailOtpTarget !== email) {
        showAuthMessage('Email OTP भेजें और वही email इस्तेमाल करें (Send OTP for this email)', 'error');
        return;
    }

    const phoneTarget = phoneOtpTarget || normalizePhoneTarget(document.getElementById('phone').value.trim());
    if (!phoneTarget) {
        showAuthMessage('Phone OTP भेजें और वही phone इस्तेमाल करें (Send OTP for this phone)', 'error');
        return;
    }

    const verifyEmail = await verifyOtp('email', emailOtpTarget, emailOtp);
    if (!verifyEmail.ok) {
        showAuthMessage(verifyEmail.data?.message || 'Email OTP verification failed', 'error');
        return;
    }

    const verifyPhone = await verifyOtp('phone', phoneTarget, phoneOtp);
    if (!verifyPhone.ok) {
        showAuthMessage(verifyPhone.data?.message || 'Phone OTP verification failed', 'error');
        return;
    }

    // Call signup API
    await submitSignupForm(firstName, lastName, email, phone, dob);
}

// Submit signup form to backend
async function submitSignupForm(firstName, lastName, email, phone, dob) {
    try {
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'खाता बनाया जा रहा है... (Creating Account...)';
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/auth/auto-signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone,
                dob
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Account created successfully
            console.log('✅ Signup successful:', data);
            
            // Save token if provided
            if (data.token) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
                localStorage.setItem('userEmail', data.email);
            }

            showSuccessMessage(data, email);
        } else {
            showAuthMessage(data.message || 'खाता बनाने में विफल (Failed to create account)', 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Signup error:', error);
        showAuthMessage('त्रुटि: कृपया फिर से प्रयास करें (Error: Please try again)', 'error');
        
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'खाता बनाएं (Create Account)';
        submitBtn.disabled = false;
    }
}

// Show success message
function showSuccessMessage(data, email) {
    const authMessage = document.getElementById('authMessage');
    
    let html = `
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #155724; margin-bottom: 15px;">🎉 स्वागत है! खाता सफलतापूर्वक बनाया गया (Account Created Successfully!)</h3>
            
            <p style="color: #155724; margin-bottom: 10px;">
                <strong>${data.firstName} ${data.lastName},</strong> आपका खाता सफलतापूर्वक बनाया गया है।
            </p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
                <p style="color: #333; margin: 5px 0;">
                    <strong>📧 आपके यूजर आईडी और पासवर्ड:</strong><br>
                    <code style="background-color: #f8f9fa; padding: 8px; border-radius: 3px; display: block; margin-top: 5px;">
                        ${email} पर भेजे गए हैं
                    </code>
                </p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0;">
                    <strong>⚠️ अगली शर्तें:</strong><br>
                    1. अपने ईमेल की जांच करें - आपके लॉगिन विवरण वहां भेजे गए हैं<br>
                    2. साइन इन पेज से लॉगिन करें<br>
                    3. अपने डैशबोर्ड में जाएं
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.location.href='signin.html'" style="
                    background-color: #28a745;
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                ">
                    🚀 अभी लॉगिन करें (Sign In Now)
                </button>
                
                <button onclick="location.reload()" style="
                    background-color: #6c757d;
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    नया खाता बनाएं (Create Another)
                </button>
            </div>
        </div>
    `;
    
    authMessage.innerHTML = html;
    authMessage.style.display = 'block';
    
    // Scroll to message
    authMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Reset form
    document.getElementById('signupForm').reset();
    
    // Auto-redirect after 5 seconds
    setTimeout(() => {
        window.location.href = 'signin.html';
    }, 5000);
}

// Show auth message
function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    
    let bgColor = '#f8d7da';
    let textColor = '#721c24';
    let borderColor = '#f5c6cb';
    let icon = '⚠️';
    
    if (type === 'success') {
        bgColor = '#d4edda';
        textColor = '#155724';
        borderColor = '#c3e6cb';
        icon = '✅';
    }
    
    authMessage.innerHTML = `
        <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 15px; color: ${textColor};">
            <strong>${icon} ${message}</strong>
        </div>
    `;
    authMessage.style.display = 'block';
    
    // Scroll to message
    authMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Auto-hide error messages
    if (type === 'error') {
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }
}
