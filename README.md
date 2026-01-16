# ◢ TIMED PLANNER ◣

<div align="center">

**A retro synth-wave themed MERN stack task planner**

*Schedule your day with style and precision*

[Quick Start](./QUICKSTART.md) • [Deployment Guide](./DEPLOYMENT.md)

</div>

---

## ✨ Features

### 🔐 Authentication System
- Email verification with 6-digit codes sent to user's inbox
- Unique email addresses (case-insensitive)
- Unique nicknames (case-sensitive, character-sensitive)
- Secure JWT-based authentication
- Password hashing with bcrypt

### 📅 Daily Planning
- **Create Your Plan**: Set up your day with start and end times
- **Calendar Selection**: Choose any date for planning
- **Task Management**: Add tasks with:
  - Task name
  - Start and end times
  - Category selection (Productive, Leisure, Break, Wasted)
- **Overlap Prevention**: System prevents conflicting task times
- **Sequential Ordering**: Tasks are automatically ordered by time

### ⚡ Smart Task Tracking
- **Mark Complete**: Simple checkmark to mark tasks done
- **Time Adjustment**: Adjust actual completion time if delayed
- **Domino Effect**: Automatically shifts all subsequent tasks when one task runs over
- **Progress Tracking**: Visual progress bars and statistics
- **Category Breakdown**: See how your time is distributed

### 🎨 Retro Synth-Wave Design
- Neon pink and cyan color scheme
- Animated grid backgrounds with moving perspective
- Glitch effects on headers
- Glowing borders and shadows
- Custom fonts (Orbitron & Share Tech Mono)
- Smooth animations and transitions
- Fully responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- MongoDB Atlas account (free tier)
- Gmail account (for email verification)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Create `.env` file** in root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_at_least_32_characters
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   CLIENT_URL=http://localhost:5173
   PORT=5000
   NODE_ENV=development
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📖 How It Works

### User Journey

1. **Sign Up**
   - Enter email address
   - Receive 6-digit verification code via email
   - Enter verification code
   - Set password and choose a nickname
   - Account created!

2. **Dashboard**
   - Greeted with "Hello, [NICKNAME]"
   - Two main options:
     - **Create Your Plan**: Set up a new day's schedule
     - **My Plan**: View and manage existing plans

3. **Create Your Plan**
   - Select a date from calendar
   - Set day start time (e.g., 6:00 AM)
   - Set day end time (e.g., 11:00 PM)
   - Add tasks one by one:
     - Task name (e.g., "Study Mathematics")
     - Start time (e.g., 9:00 AM)
     - End time (e.g., 10:30 AM)
     - Category (Productive/Leisure/Break/Wasted)
   - Tasks cannot overlap
   - Next task must start after previous task ends

4. **My Plan**
   - View plan for any date
   - See all tasks in timeline format
   - Mark tasks complete with ✓ button
   - If task took longer:
     - Click "Adjust Time"
     - Enter actual completion time
     - All subsequent tasks automatically shift (domino effect)
   - Track progress with visual bar
   - View category breakdown statistics

### The Domino Effect

This is the key feature! When you complete a task and it took longer than planned:

**Example:**
```
Original Schedule:
09:00 - 10:00  Study Math
10:00 - 11:00  Exercise
11:00 - 12:00  Lunch

You complete "Study Math" at 10:30 (30 min delay)

Updated Schedule:
09:00 - 10:30  Study Math ✓ (completed)
10:30 - 11:30  Exercise (automatically shifted)
11:30 - 12:30  Lunch (automatically shifted)
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library (latest version)
- **Vite** - Build tool (fast!)
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **date-fns** - Date formatting

### Deployment
- **Vercel** - Hosting platform
- **MongoDB Atlas** - Cloud database
- **Gmail SMTP** - Email service

## 📁 Project Structure

```
timed/
├── server/               # Backend
│   ├── config/
│   │   └── db.js        # MongoDB connection
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   ├── models/
│   │   ├── User.js      # User model
│   │   └── Plan.js      # Plan & Task models
│   ├── routes/
│   │   ├── auth.js      # Auth routes
│   │   └── plans.js     # Plan routes
│   ├── utils/
│   │   └── email.js     # Email utility
│   └── index.js         # Server entry
│
├── client/              # Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   └── index.html
│
├── .env.example         # Environment template
├── vercel.json          # Vercel config
├── DEPLOYMENT.md        # Deployment guide
├── QUICKSTART.md        # Quick reference
└── package.json
```

## 🚢 Deployment

Ready to deploy? Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

Quick summary:
1. Set up MongoDB Atlas
2. Configure Gmail App Password
3. Push to GitHub
4. Deploy on Vercel
5. Add environment variables
6. Done!

## 🎯 Key Features Implementation

### Email Verification
- Uses Nodemailer with Gmail SMTP
- Generates 6-digit random codes
- Codes expire after 10 minutes
- Retro-themed email template with HTML/CSS

### Security
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for authentication
- Token expires after 30 days
- Protected routes with middleware
- Input validation on all endpoints

### Database Design
- User collection: email, password, nickname, verification data
- Plan collection: userId, date, day times, tasks array
- Task subdocuments: name, times, category, completion status
- Indexes for faster queries

### Task Time Logic
- Validates no overlaps when adding tasks
- Converts times to minutes for calculations
- Implements domino effect with time shifting
- Preserves actual completion times for reference

## 🎨 Design Philosophy

The retro synth-wave aesthetic creates a unique, engaging experience:

- **Colors**: Neon pink, cyan, purple on dark backgrounds
- **Typography**: Orbitron (headers), Share Tech Mono (mono)
- **Effects**: Glow shadows, animated grids, glitch text
- **Accessibility**: High contrast, clear labels, keyboard navigation
- **Responsiveness**: Mobile-first, adapts to all screen sizes

## 🐛 Troubleshooting

### Email not sending?
- Verify Gmail App Password is correct
- Check 2-factor authentication is enabled
- Try generating a new App Password

### Can't connect to database?
- Verify MongoDB connection string
- Check network access (whitelist 0.0.0.0/0 for Vercel)
- Ensure database user has correct permissions

### Build errors?
- Run `npm install` in both root and client folders
- Clear node_modules and reinstall
- Check Node.js version (16+)

## 📄 License

ISC License - feel free to use and modify!

## 🙏 Acknowledgments

Built with modern web technologies and a love for retro aesthetics.

---

<div align="center">

**Ready to plan your day in style?** 

Start with `npm install` and `npm run dev`

[View Quick Start →](./QUICKSTART.md)

</div>
