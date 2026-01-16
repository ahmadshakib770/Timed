# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (free)
- Gmail account for email verification

### Installation

1. **Clone and Install**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Setup Environment Variables**
   
   Create `.env` file in root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_min_32_characters
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   CLIENT_URL=http://localhost:5173
   PORT=5000
   NODE_ENV=development
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## 📱 Features

### Authentication
- ✅ Email verification with code
- ✅ Unique email and nickname validation (case-sensitive)
- ✅ Secure JWT authentication
- ✅ Password hashing with bcrypt

### Plan Management
- ✅ Create daily plans with start/end times
- ✅ Add tasks with time slots
- ✅ 4 categories: Productive, Leisure, Break, Wasted
- ✅ Prevent task overlap validation
- ✅ Sequential task ordering

### Task Tracking
- ✅ Mark tasks as complete
- ✅ Adjust completion time
- ✅ **Domino Effect**: Auto-adjust subsequent tasks when one is delayed
- ✅ Visual progress tracking
- ✅ Category breakdown statistics

### UI/UX
- 🎨 Retro synth-wave theme
- 💫 Neon glow effects
- 🎭 Animated backgrounds
- 📱 Fully responsive design
- ♿ Accessible interface

## 🎨 Design Theme

The app features a **retro synth-wave aesthetic** with:
- Neon pink (#ff00ff) and cyan (#00ffff) color scheme
- Animated grid backgrounds
- Glitch effects on titles
- Glowing borders and shadows
- Orbitron and Share Tech Mono fonts
- Smooth transitions and animations

## 📋 User Flow

1. **Signup Process**
   - Enter email → Receive verification code
   - Enter code → Set password and nickname
   - Login with credentials

2. **Dashboard**
   - Welcome message with user's nickname
   - Two options: "Create Your Plan" or "My Plan"

3. **Create Plan**
   - Select date from calendar
   - Set day start/end times
   - Add tasks sequentially with:
     - Task name
     - Start and end times
     - Category selection
   - Tasks cannot overlap

4. **My Plan**
   - View plan for selected date
   - Mark tasks complete with ✓
   - Adjust completion time if delayed
   - See automatic time adjustments for subsequent tasks

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer
- **Validation**: express-validator

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Date Handling**: date-fns

### Deployment
- **Platform**: Vercel
- **Serverless**: Vercel Functions
- **Database**: MongoDB Atlas
- **Email**: Gmail SMTP

## 📁 Project Structure

```
timed/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Plan.js            # Plan & Task schemas
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   └── plans.js           # Plan endpoints
│   ├── utils/
│   │   └── email.js           # Email service
│   └── index.js               # Server entry
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePlan.jsx
│   │   │   └── MyPlan.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── index.html
├── .env.example
├── vercel.json
└── package.json
```

## 🔐 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiration
- Email verification required for signup
- Unique email and nickname constraints
- Environment variables for sensitive data
- CORS protection

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/request-verification` - Request email verification code
- `POST /api/auth/verify-code` - Verify email code
- `POST /api/auth/complete-signup` - Complete signup with password & nickname
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Plans
- `POST /api/plans` - Create new plan (protected)
- `GET /api/plans` - Get all user plans (protected)
- `GET /api/plans/:date` - Get plan by date (protected)
- `POST /api/plans/:planId/tasks` - Add task to plan (protected)
- `PUT /api/plans/:planId/tasks/:taskId/complete` - Complete task (protected)
- `DELETE /api/plans/:planId/tasks/:taskId` - Delete task (protected)
- `DELETE /api/plans/:planId` - Delete plan (protected)

## ⚙️ Domino Effect Logic

When a task is completed with an adjusted time:

1. Calculate delay: `actualEndTime - originalEndTime`
2. Find all subsequent tasks
3. Shift each task's start and end times by the delay amount
4. Update plan and notify user

Example:
```
Original:
Task 1: 9:00 - 10:00
Task 2: 10:00 - 11:00
Task 3: 11:00 - 12:00

Task 1 completed at 10:30 (+30min delay)

Updated:
Task 1: 9:00 - 10:30 (completed)
Task 2: 10:30 - 11:30 (shifted)
Task 3: 11:30 - 12:30 (shifted)
```

## 🚢 Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
```bash
vercel
```

## 📝 License

ISC

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!
