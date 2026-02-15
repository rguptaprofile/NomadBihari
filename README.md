# Nomad Bihari - Travel & Blogging Platform

A comprehensive travel and blogging platform where explorers can share their experiences, photos, and travel stories with a global community.

## 🌍 Project Overview

Nomad Bihari is a full-stack web application built with:
- **Frontend**: HTML5, CSS3, JavaScript (Responsive Design)
- **Backend**: Node.js with Express
- **Database**: MySQL 
- **API**: RESTful API
- **AI Integration**: OpenAI API for content optimization

## 📋 Complete Features

### User Features
- ✅ User Registration with Email & Phone OTP Verification (5-minute validity)
- ✅ User Authentication & Session Management
- ✅ Personal Dashboard with Multiple Sections
- ✅ Photo & Video Upload for Travel Content
- ✅ Article Publishing with SEO Optimization
- ✅ Post Visibility Control (Public/Private)
- ✅ Like, Comment, Share Functionality (Real-time)
- ✅ User Profile Management
- ✅ Analytics & Engagement Tracking
- ✅ Push Notification Subscriptions

### Admin Features
- ✅ Admin Dashboard with Full Analytics
- ✅ User Management & Monitoring
- ✅ Post Management & Moderation
- ✅ Website Analytics & Metrics
- ✅ Revenue Tracking

### Additional Features
- ✅ AI-Powered Chatbot ("May I Help You")
- ✅ AI Content Optimization (OpenAI)
- ✅ SEO System for Content Ranking
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Real-time Notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Installation

**1. Database Setup**
```bash
mysql -u root -p < database/nomad_bihari_schema.sql
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

Backend runs on: `http://localhost:5000`

**3. Frontend Setup**
```bash
cd frontend
python -m http.server 8000
# Or use: npx http-server -p 8000
```

Frontend runs on: `http://localhost:8000`

## 🔐 Default Admin Credentials
- Email: `admin@nomadbihari.com`
- Password: `Admin@123`

## 📁 Project Structure

```
NomadBihari/
├── frontend/          # HTML5, CSS3, JavaScript
├── backend/           # Node.js Express API
├── database/          # MySQL Schema
└── README.md         # This file
```

## 📱 Responsive Design
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (<768px)
- ✅ Hamburger menu on small screens

## 🔑 Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Pure - No frameworks)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT + OTP
- **AI**: OpenAI API integration
- **Email**: Nodemailer
- **Security**: bcryptjs, CORS, JWT

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | User registration |
| POST | /api/auth/user-login | User login |
| POST | /api/auth/admin-login | Admin login |
| POST | /api/auth/send-email-otp | Send email OTP |
| POST | /api/auth/verify-email-otp | Verify email OTP |
| POST | /api/posts | Create post |
| GET | /api/posts/feed | Get feed |
| POST | /api/posts/{id}/like | Like post |
| GET | /api/users/{id} | Get profile |
| GET | /api/admin/users | All users (admin) |

## 🎨 Design Features

- Modern gradient color scheme
- Smooth animations and transitions
- Professional UI/UX
- Mobile-first responsive design
- Accessibility features
- Fast loading times

## 🔒 Security Features

- Password hashing (bcryptjs)
- JWT token authentication
- OTP verification
- CORS protection
- Input validation
- SQL injection prevention

## 📧 Environment Configuration

Create `.env` in backend folder:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=nomad_bihari
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OPENAI_API_KEY=your-api-key
```

## 🎯 User Flow

1. **Signup**: Email + Phone OTP verification → Account creation
2. **Login**: User ID/Email + Password → Dashboard access
3. **Create Post**: Upload photos/videos → Write article → Set visibility
4. **Engagement**: Like → Comment → Share → Analytics tracking
5. **Admin**: View all users → Manage posts → Monitor analytics

## 📊 Database Schema

10+ tables including:
- Users, Posts, Media
- Likes, Comments, Shares
- Notifications, Analytics
- OTP, Sessions, Admin

## 🌐 Responsive Implementation

- CSS Media Queries
- Flexbox Layout
- Mobile-first approach
- Touch-friendly controls
- Font sizing for accessibility

## ❓ FAQ & Troubleshooting

**Q: Database not connecting?**
A: Check MySQL is running, verify credentials in .env

**Q: OTP not sending?**
A: For Gmail, use App Password, enable "Less secure apps"

**Q: CORS error?**
A: Verify frontend & backend URLs in configuration

**Q: Port already in use?**
A: Change PORT in .env or kill existing process

## 🎓 Learning Path

This project teaches:
- Full-stack development
- API design & REST principles
- Database design & optimization
- Authentication & security
- Responsive web design
- JavaScript fundamentals
- Node.js & Express.js
- MySQL basics
- Real-time features
- Deployment practices

## 📝 License

MIT License - Free to use for personal & commercial projects

## 👨‍💻 Support

For issues or questions, check the documentation or API endpoints.

---

**Built with ❤️ for Travel Enthusiasts**

Last Updated: February 2025
