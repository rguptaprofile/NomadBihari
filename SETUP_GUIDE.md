# Nomad Bihari - Complete Setup and Deployment Guide

## System Overview

This system now includes complete authentication, user dashboards, admin dashboards, and real-time activity logging.

### Key Features Implemented:

1. **User Authentication**
   - User Signup with email/phone OTP verification
   - User Login with credentials
   - Session management with JWT tokens
   - Auto-redirect to User Dashboard

2. **Admin Authentication**
   - Admin Login with predefined credentials
   - JWT token-based session management
   - Auto-redirect to Admin Dashboard

3. **User Dashboard**
   - User profile management
   - Feed viewing
   - Post management
   - Analytics
   - Settings

4. **Admin Dashboard**
   - User management (view, search, delete)
   - Post management (view, search, delete, create)
   - Analytics and insights
   - Contact query management
   - Activity logging

5. **Real-time Activity Logging**
   - User signup/login activities
   - Admin actions
   - All user interactions stored in database

## Admin Credentials

Two admin accounts have been configured:

### Admin 1:
- **Email:** gupta.rahul.hru@gmail.com
- **Password:** Admin1-9525.com
- **Name:** Rahul Gupta

### Admin 2:
- **Email:** kumarravi69600@gmail.com
- **Password:** Chudail@143
- **Name:** Ravi Kumar

## Database Setup

### 1. Create Activity Logging Tables

Run the following SQL to create activity logging tables:

```sql
-- User Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
  INDEX (admin_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Website Analytics Table
CREATE TABLE IF NOT EXISTS website_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  activity_type VARCHAR(50),
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (user_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Contact messages table (if not exists)
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (created_at)
);
```

### 2. Insert Admin Credentials

Run the setup script:

```bash
cd backend
node setup-admin-credentials.js
```

Copy the generated SQL statements and run them in your database, OR manually insert:

```sql
INSERT INTO admin (email, password_hash, admin_name, created_at, updated_at)
VALUES 
('gupta.rahul.hru@gmail.com', '$2a$10$hash_here', 'Rahul Gupta', NOW(), NOW()),
('kumarravi69600@gmail.com', '$2a$10$hash_here', 'Ravi Kumar', NOW(), NOW());
```

## Backend Setup

### 1. Install Dependencies (if not already done)

```bash
cd backend
npm install
```

### 2. Environment Variables (.env)

Create a `.env` file in the backend directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nomad_bihari
PORT=5000
JWT_SECRET=your_secret_key_change_in_production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Start the Backend Server

```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

## Frontend Setup

### 1. Location Check

Ensure frontend files are in:
```
frontend/
  pages/
    signin.html     ✓ Updated with proper scripts
    signup.html     ✓ Updated with proper scripts
  js/
    main.js         ✓ Contains API_BASE_URL
    dashboard.js    ✓ User dashboard
    admin-dashboard.js ✓ Admin dashboard
    signin.js       ✓ Updated login logic
```

### 2. API Base URL

In `frontend/js/main.js`, the API base URL is set to:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Change this if your backend runs on a different port/domain.

### 3. Serve Frontend

Option 1: Using Python:
```bash
cd frontend
python -m http.server 8000
# Access at http://localhost:8000
```

Option 2: Using Node.js:
```bash
npm install -g http-server
cd frontend
http-server
```

## Usage Flow

### User Registration & Login

1. **Visit Signup Page:** `http://localhost:8000/pages/signup.html`
   - Fill in registration form
   - Verify email (OTP - for demo, use any 6 digits)
   - Verify phone (OTP - for demo, use any 6 digits)
   - Complete signup
   - Auto-redirect to User Dashboard

2. **User Dashboard:** `http://localhost:8000/dashboard.html`
   - Profile management
   - View feed
   - Manage posts
   - View analytics
   - Settings

### Admin Login

1. **Visit Signin Page:** `http://localhost:8000/pages/signin.html`
   - Click on "Admin Login" tab
   - Enter credentials:
     - Email: `gupta.rahul.hru@gmail.com`
     - Password: `Admin1-9525.com`
     - OR
     - Email: `kumarravi69600@gmail.com`
     - Password: `Chudail@143`
   - Auto-redirect to Admin Dashboard

2. **Admin Dashboard:** `http://localhost:8000/admin-dashboard.html`
   - View dashboard overview (users, posts, engagement)
   - User management (search, view, delete)
   - Post management (search, view, delete, create)
   - Analytics and graphs
   - Contact query management
   - Activity logs

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/signup
- Register new user
- Body: {firstName, lastName, email, phone, dob, userId, password, emailVerified, phoneVerified}

POST /api/auth/user-login
- Login user
- Body: {userIdOrEmail, password, rememberMe}

POST /api/auth/admin-login
- Login admin
- Body: {email, password}

POST /api/auth/send-email-otp
- Send email OTP
- Body: {email, type}

POST /api/auth/send-phone-otp
- Send phone OTP
- Body: {phone, type}

POST /api/auth/verify-email-otp
- Verify email OTP
- Body: {email, otp}

POST /api/auth/verify-phone-otp
- Verify phone OTP
- Body: {phone, otp}
```

### Admin Endpoints

```
GET /api/admin/dashboard/overview
- Get dashboard statistics

GET /api/admin/users
- Get all users (with search)
- Query: ?search=keyword

DELETE /api/admin/users/:userId
- Soft delete user

GET /api/admin/posts
- Get all posts (with search)
- Query: ?search=keyword

POST /api/admin/posts
- Create new post
- Body: {title, description, content, featuredImage, visibility}

DELETE /api/admin/posts/:postId
- Soft delete post

GET /api/admin/analytics
- Get analytics data

GET /api/admin/contact-queries
- Get contact messages

GET /api/admin/activity-logs
- Get admin activity logs
```

## Demo Credentials

### User Demo (for testing)
- Username: `demo`
- Password: `demo123`

### Admin Demo
- Email: `gupta.rahul.hru@gmail.com`
- Password: `Admin1-9525.com`

OR

- Email: `kumarravi69600@gmail.com`
- Password: `Chudail@143`

## Database Tables Structure

All data is stored in the following tables:

1. **users** - User account information
2. **admin** - Admin account information
3. **activity_logs** - User activities (signup, login, post creation, etc.)
4. **admin_activity_logs** - Admin activities (login, user deletion, post management)
5. **posts** - User posts/articles
6. **comments** - Post comments
7. **likes** - Post likes
8. **shares** - Post shares
9. **media** - Photos and videos
10. **contact_messages** - Contact form submissions
11. **website_analytics** - Website analytics data

## Real-time Activity Tracking

All user and admin activities are logged in real-time:

- User Signup: Logged in `activity_logs`
- User Login: Logged in `activity_logs`
- Admin Login: Logged in `admin_activity_logs`
- Post Creation: Will be logged when created
- User Deletion: Will be logged when deleted
- Post Deletion: Will be logged when deleted

## Troubleshooting

### 1. "Cannot connect to backend"
- Ensure backend server is running on port 5000
- Check if API_BASE_URL in `frontend/js/main.js` is correct
- Check browser console for error messages

### 2. "Login fails"
- Ensure database is connected
- Verify admin credentials are inserted in admin table
- Check .env file for correct database credentials

### 3. "Pages not displaying"
- Clear browser cache
- Check if JavaScript files are linked in HTML
- Check browser console for errors

### 4. "OTP not working"
- In demo mode, any 6-digit code works
- For production, configure email/SMS service
- Check email settings in .env file

## Production Deployment

1. Update API_BASE_URL to production domain
2. Change JWT_SECRET to a strong random value
3. Enable HTTPS
4. Setup proper email service (Gmail, SendGrid, etc.)
5. Update CORS settings in backend
6. Setup SSL certificates
7. Configure database backups
8. Monitor activity logs regularly

## Contact & Support

For issues or questions, please refer to the documentation or check the console for error messages.

---

**Last Updated:** February 20, 2026
**Version:** 1.0.0
