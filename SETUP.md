# Setup Instructions

Follow these steps to get your Timed Planner up and running!

## Step 1: Install Dependencies

Run these commands in your terminal:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Setup MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `myFirstDatabase` with `timed-planner`

Your connection string should look like:
```
mongodb+srv://username:yourpassword@cluster.mongodb.net/timed-planner
```

## Step 3: Setup Gmail for Email Verification

1. Use a Gmail account (create one if needed)
2. Enable 2-Factor Authentication:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

3. Generate App Password:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Name it "Timed Planner"
   - Click "Generate"
   - Copy the 16-character password (no spaces)

## Step 4: Create Environment File

Create a file named `.env` in the root directory (where package.json is) with this content:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timed-planner

# JWT Secret (random string, at least 32 characters)
JWT_SECRET=your_very_long_random_secret_key_here_min_32_chars

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your16charapppassword

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Generate JWT Secret

Run this in your terminal to generate a secure random string:

**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Or use any random 32+ character string.

## Step 5: Verify Setup

Check that you have:
- ✅ `node_modules` folder in root directory
- ✅ `client/node_modules` folder
- ✅ `.env` file in root with all variables filled
- ✅ MongoDB connection string is correct
- ✅ Gmail app password is 16 characters (no spaces)

## Step 6: Start Development Server

Run this command:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster.mongodb.net
```

And in another window:
```
VITE ready
Local: http://localhost:5173
```

## Step 7: Test the Application

1. Open browser to http://localhost:5173
2. Click "Create Account"
3. Enter your email
4. Check your email for verification code
5. Complete signup

## Common Issues

### "Cannot connect to MongoDB"
- Check your MongoDB connection string
- Verify database user password
- Make sure network access allows all IPs (0.0.0.0/0)

### "Email not sending"
- Verify EMAIL_USER is your full Gmail address
- Check EMAIL_PASS is the 16-character app password (no spaces)
- Confirm 2-factor authentication is enabled
- Try generating a new app password

### "Port already in use"
- Change PORT in .env to a different number (e.g., 5001)
- Or kill the process using that port

### "Module not found"
- Delete node_modules folders
- Run `npm install` again in root and client folders

## Next Steps

Once everything is running:

1. **Create your first plan**: Click "Create Your Plan"
2. **Explore the features**: Try the domino effect by adjusting task times
3. **Customize**: Modify colors, fonts, or features as you like
4. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) when ready

## Need Help?

- Check [QUICKSTART.md](./QUICKSTART.md) for feature overview
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment
- Review error messages in terminal for clues

## Configuration Checklist

Before starting development, verify:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access allows all IPs
- [ ] Gmail 2FA enabled
- [ ] Gmail app password generated
- [ ] `.env` file created with all variables
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`cd client && npm install`)
- [ ] MongoDB connection string tested
- [ ] Email credentials tested

## Success Indicators

You'll know everything is working when:

✅ No errors in terminal
✅ "MongoDB Connected" message appears
✅ Can access http://localhost:5173
✅ Signup page loads with retro theme
✅ Verification email arrives
✅ Can complete signup process
✅ Dashboard appears after login

---

**Happy Planning! ◢◣**
