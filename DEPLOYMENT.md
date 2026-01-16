# Timed Planner - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **MongoDB Atlas Account** (free tier works)
   - Create a cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string

2. **Gmail Account** (for email verification)
   - Enable 2-factor authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords

3. **Vercel Account** (free tier works)
   - Sign up at https://vercel.com

## Step-by-Step Deployment

### 1. Prepare Your MongoDB Database

1. Go to MongoDB Atlas
2. Create a new cluster (free tier M0)
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/timed-planner
   ```

### 2. Setup Gmail App Password

1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. App Passwords → Generate new app password
4. Select "Mail" and "Other" (name it "Timed Planner")
5. Copy the 16-character password

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. Go to Vercel Dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: client/dist

6. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key_at_least_32_characters
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   CLIENT_URL=https://your-vercel-app.vercel.app
   NODE_ENV=production
   ```

7. Click "Deploy"

#### Option B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   vercel env add CLIENT_URL
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### 4. Update CLIENT_URL

After first deployment:
1. Copy your Vercel URL (e.g., https://timed-planner.vercel.app)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `CLIENT_URL` with your actual Vercel URL
4. Redeploy the project

### 5. Test Your Deployment

1. Visit your Vercel URL
2. Click "Create Account"
3. Enter your email
4. Check your email for verification code
5. Complete signup and test creating a plan

## Troubleshooting

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASS are correct
- Verify 2-factor authentication is enabled
- Make sure you're using an App Password, not your regular password
- Check Gmail security settings

### Database Connection Issues
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0
- Check database user has correct permissions

### Build Failures
- Check all dependencies are listed in package.json
- Verify build command is correct
- Check Vercel build logs for specific errors

### API Routes Not Working
- Verify vercel.json is in the root directory
- Check API routes start with /api
- Review Vercel function logs

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/dbname |
| JWT_SECRET | Secret key for JWT tokens (min 32 chars) | your_super_secret_random_string_here |
| EMAIL_USER | Gmail address for sending emails | your-email@gmail.com |
| EMAIL_PASS | Gmail App Password (16 characters) | abcd efgh ijkl mnop |
| CLIENT_URL | Your Vercel app URL | https://your-app.vercel.app |
| NODE_ENV | Environment (set to production) | production |

## Local Development

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. Create `.env` file in root (copy from `.env.example`)

3. Add your local environment variables

4. Run development server:
   ```bash
   npm run dev
   ```

5. Backend runs on http://localhost:5000
6. Frontend runs on http://localhost:5173

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## Support

If you encounter issues:
1. Check Vercel function logs
2. Review MongoDB Atlas logs
3. Test email sending locally first
4. Verify all environment variables are set correctly
