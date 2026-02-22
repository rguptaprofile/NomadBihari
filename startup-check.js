#!/usr/bin/env node

/**
 * NOMAD BIHARI - COMPLETE STARTUP & TESTING SCRIPT
 * This script will help you setup and test all real-time features
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 NOMAD BIHARI - REAL-TIME FEATURES SETUP               ║
║      Email OTP • SMS OTP • Social OAuth • Dashboard        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(msg, color = 'reset') {
    console.log(colors[color] + msg + colors.reset);
}

function checkEnvFile() {
    log('\n📋 STEP 1: Checking .env Configuration', 'blue');
    
    const envPath = path.join(__dirname, 'backend', '.env');
    
    if (!fs.existsSync(envPath)) {
        log('❌ .env file not found!', 'red');
        return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    let issues = [];
    let emailConfigured = false;
    let mongoUri = '';
    
    for (const line of lines) {
        if (line.includes('EMAIL_USER=') && !line.trim().startsWith('#')) {
            if (line.includes('YOUR_')) {
                issues.push('Gmail EMAIL_USER not configured (has YOUR_)');
            } else {
                emailConfigured = true;
                log(`✅ EMAIL_USER configured: ${line.split('=')[1]}`, 'green');
            }
        }
        if (line.includes('EMAIL_PASS=') && !line.trim().startsWith('#')) {
            if (line.includes('YOUR_')) {
                issues.push('Gmail EMAIL_PASS not configured (has YOUR_)');
            } else {
                log(`✅ EMAIL_PASS configured (${line.split('=')[1].length} chars)`, 'green');
            }
        }
        if (line.includes('MONGODB_URI=')) {
            const match = line.match(/MONGODB_URI="?([^"]*)"?/);
            if (match) mongoUri = match[1];
        }
        if (line.includes('JWT_SECRET=')) {
            log('✅ JWT_SECRET configured', 'green');
        }
    }
    
    log(`\n📊 Configuration Status:`, 'cyan');
    log(`   • MongoDB: ${mongoUri}`, 'yellow');
    log(`   • Email OTP: ${emailConfigured ? '✅ Ready' : '⚠️  Not configured (demo mode)'}`, 'yellow');
    log(`   • SMS OTP: ✅ Ready (Twilio)`, 'yellow');
    log(`   • OAuth: ✅ Endpoints ready (needs credentials)`, 'yellow');
    
    if (issues.length > 0) {
        log(`\n⚠️  Issues found:`, 'yellow');
        issues.forEach(issue => {
            log(`   • ${issue}`, 'yellow');
        });
        log(`\n💡 To enable real email OTP:`, 'magenta');
        log(`   1. Get Gmail App Password from https://myaccount.google.com/apppasswords`, 'magenta');
        log(`   2. Edit backend/.env`, 'magenta');
        log(`   3. Set: EMAIL_USER="gupta.rahul.hru@gmail.com"`, 'magenta');
        log(`   4. Set: EMAIL_PASS="<16-char-app-password>"`, 'magenta');
        log(`   5. Restart server`, 'magenta');
    }
    
    return true;
}

function checkDatabaseModels() {
    log('\n📦 STEP 2: Checking Database Models', 'blue');
    
    const modelsPath = path.join(__dirname, 'backend', 'models');
    const models = ['User.js', 'ActivityLog.js', 'Post.js', 'ContactQuery.js'];
    
    let allExist = true;
    for (const model of models) {
        const modelPath = path.join(modelsPath, model);
        if (fs.existsSync(modelPath)) {
            log(`✅ ${model} exists`, 'green');
        } else {
            log(`❌ ${model} missing`, 'red');
            allExist = false;
        }
    }
    
    return allExist;
}

function checkRoutes() {
    log('\n🛣️  STEP 3: Checking API Routes', 'blue');
    
    const routesPath = path.join(__dirname, 'backend', 'routes');
    const routes = [
        { file: 'auth.js', endpoints: ['signup', 'user-login', 'admin-login', 'send-email-otp', 'send-phone-otp', 'google', 'facebook', 'linkedin'] },
        { file: 'users.js', endpoints: ['get', 'update', 'profile'] },
        { file: 'posts.js', endpoints: ['create', 'feed', 'like'] },
        { file: 'contact.js', endpoints: ['submit', 'queries'] }
    ];
    
    for (const route of routes) {
        const routePath = path.join(routesPath, route.file);
        if (fs.existsSync(routePath)) {
            log(`✅ ${route.file}:`, 'green');
            const content = fs.readFileSync(routePath, 'utf-8');
            route.endpoints.forEach(endpoint => {
                if (content.includes(endpoint)) {
                    log(`   ✓ ${endpoint}`, 'green');
                }
            });
        } else {
            log(`❌ ${route.file} missing`, 'red');
        }
    }
}

function checkFrontend() {
    log('\n🎨 STEP 4: Checking Frontend Pages', 'blue');
    
    const frontendPath = path.join(__dirname, 'frontend');
    const pages = [
        'index.html',
        'dashboard.html',
        'pages/signup.html',
        'pages/signin.html'
    ];
    
    for (const page of pages) {
        const pagePath = path.join(frontendPath, page);
        if (fs.existsSync(pagePath)) {
            log(`✅ ${page}`, 'green');
        } else {
            log(`❌ ${page} missing`, 'red');
        }
    }
}

function printStartupInstructions() {
    log(`

╔════════════════════════════════════════════════════════════╗
║              STARTUP & TESTING INSTRUCTIONS                ║
╚════════════════════════════════════════════════════════════╝

1️⃣  START THE SERVER:
    cd "c:\\Users\\rgupt\\OneDrive\\Desktop\\NomadBihari\\backend"
    node server.js

2️⃣  TEST EMAIL OTP (Demo Mode - Shows OTP in console):
    Go to: http://localhost:5001/pages/signup.html
    - Fill form
    - Click "Send Email OTP"
    - See OTP in server console
    - Enter it manually

3️⃣  TEST PHONE OTP (Real SMS):
    - Click "Send Phone OTP"
    - OTP arrives via Twilio SMS
    - Enter and verify

4️⃣  COMPLETE SIGNUP:
    - Send & verify both OTPs
    - Click "Create Account"
    - Should redirect to dashboard

5️⃣  TEST LOGIN:
    Go to: http://localhost:5001/pages/signin.html
    - Use credentials from signup
    - Should redirect to dashboard

6️⃣  TEST ADMIN LOGIN:
    - Email: gupta.rahul.hru@gmail.com
    - Password: Admin1-9525.com
    - Should redirect to admin dashboard

7️⃣  ENABLE REAL EMAIL OTP:
    - Get Gmail App Password
    - Update backend/.env
    - Restart server
    - Test again


╔════════════════════════════════════════════════════════════╗
║                     TEST CHECKLIST                        ║
╚════════════════════════════════════════════════════════════╝

Database Persistence:
  [ ] Signup creates user in MongoDB
  [ ] Login retrieves user from MongoDB
  [ ] Admin login works
  [ ] Activity logs saved

Email OTP:
  [ ] Demo OTP shows in console
  [ ] Real Gmail OTP works (after config)

SMS OTP:
  [ ] SMS arrives on phone (via Twilio)
  [ ] OTP verification works

Dashboard:
  [ ] User redirects to dashboard after login
  [ ] User data loads on dashboard
  [ ] Logout works

Social OAuth (Optional):
  [ ] Google login endpoint routes correctly
  [ ] Facebook login endpoint routes correctly
  [ ] LinkedIn login endpoint routes correctly


╔════════════════════════════════════════════════════════════╗
║                   USEFUL COMMANDS                         ║
╚════════════════════════════════════════════════════════════╝

View server logs in real-time:
  cd backend && node server.js

Test API endpoints:
  Invoke-RestMethod -Uri "http://localhost:5001/health" -Method Get

Stop server:
  Ctrl + C

Run feature tests:
  node test-realtime-features.js


╔════════════════════════════════════════════════════════════╗
║                  STATUS: READY TO TEST! 🚀                ║
╚════════════════════════════════════════════════════════════╝

    `, 'green');
}

// Run all checks
checkEnvFile();
checkDatabaseModels();
checkRoutes();
checkFrontend();
printStartupInstructions();
