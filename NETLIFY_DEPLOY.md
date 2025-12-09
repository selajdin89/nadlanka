# Netlify Deployment Guide

This guide will help you deploy the React frontend to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Your backend API deployed and running (Railway, Render, Heroku, etc.)
3. Git repository connected to GitHub/GitLab/Bitbucket

## Files Created for Netlify

1. **`netlify.toml`** - Netlify configuration file
2. **`client/public/_redirects`** - React Router redirects for SPA
3. **`client/src/config/api.js`** - API configuration

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin master
   ```

2. **Connect to Netlify**

   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Build Settings**

   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/dist`

   (These should be auto-detected from `netlify.toml`)

4. **Set Environment Variables**

   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`
   - Replace with your actual backend URL

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**

   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   cd client
   netlify init
   netlify deploy --prod
   ```

## Backend Deployment

Your backend needs to be deployed separately. Options:

### Railway (Recommended - Best for Free Tier ⭐)

**Free Tier:** $5/month credit (usually enough for small projects)
**Best for:** Testing, development, small projects
**Pros:** Easy setup, no sleep/spin-down, fast deployments

#### Step-by-Step Setup:

1. **Sign up at Railway**

   - Go to https://railway.app
   - Sign up with your GitHub account

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select your repository

3. **Configure the Service**

   - Click on the new service
   - Go to "Settings" → "Root Directory"
   - Set root directory to: `server`
   - Go to "Deploy" → "Settings"
   - Set start command (if needed): `npm start`

4. **Set Environment Variables**

   - Go to "Variables" tab
   - Add all variables from `server/env.example`:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secret-here
     SESSION_SECRET=your-session-secret
     CLIENT_URL=https://your-netlify-app.netlify.app
     PORT=5000
     ```
   - **Important:** Set `CLIENT_URL` to your Netlify URL after deployment

5. **Get MongoDB URI** (if you don't have one)

   - Go to https://www.mongodb.com/cloud/atlas (free tier available)
   - Create a free cluster
   - Get connection string and add to `MONGODB_URI`

6. **Deploy**
   - Railway auto-deploys when you push to GitHub
   - Or click "Redeploy" in Railway dashboard
   - Copy your app URL (e.g., `https://your-app.up.railway.app`)

---

### Render (Good Free Option - Spins Down)

**Free Tier:** Always free, but spins down after 15 min inactivity
**Best for:** Personal projects, testing
**Pros:** Truly free, reliable
**Cons:** ~30 second cold start after idle

#### Step-by-Step Setup:

1. **Sign up at Render**

   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**

   - **Name:** your-app-backend (or any name)
   - **Region:** Choose closest to you
   - **Branch:** main (or your default branch)
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Set Environment Variables**

   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secret-here
     SESSION_SECRET=your-session-secret
     CLIENT_URL=https://your-netlify-app.netlify.app
     PORT=5000
     ```

5. **Important: Configure Health Check**

   - Your server already has a health check endpoint at `/api/health`
   - In Render dashboard, set:
     - **Health Check Path:** `/api/health`

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (first deploy takes ~5 minutes)
   - Copy your app URL (e.g., `https://your-app.onrender.com`)

---

### Fly.io (Alternative Free Option)

**Free Tier:** 3 shared VMs, 3GB storage, 160GB outbound data
**Best for:** More control, better performance

#### Quick Setup:

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. In `server/` directory: `fly launch`
4. Follow prompts and set environment variables
5. Deploy: `fly deploy`

---

### Cyclic.sh (Simplest Option)

**Free Tier:** Always-on, auto-deploys
**Best for:** Quick testing

#### Quick Setup:

1. Go to https://cyclic.sh
2. Sign up with GitHub
3. Click "Deploy Now" → Select your repo
4. Set root directory to `server`
5. Add environment variables
6. Auto-deploys on every push

## Environment Variables

### Frontend (Netlify)

- `VITE_API_URL` - Your backend API URL (e.g., `https://your-app.railway.app`)

### Backend (Railway/Render/Heroku)

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `SESSION_SECRET` - Session secret
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret (optional)
- `CLIENT_URL` - Your Netlify frontend URL
- `PORT` - Server port (usually auto-set by hosting)

## CORS Configuration

Make sure your backend allows requests from your Netlify domain:

```javascript
// In server/index.js
app.use(
	cors({
		origin: process.env.CLIENT_URL || "https://your-netlify-app.netlify.app",
		credentials: true,
	})
);
```

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Ensure `node_modules` is not committed (it's in `.gitignore`)
- Verify build command: `npm install && npm run build`

### API Calls Fail

- Check `VITE_API_URL` environment variable is set correctly
- Verify backend is running and accessible
- Check CORS settings on backend
- Check browser console for errors

### React Router 404 Errors

- Ensure `_redirects` file is in `client/public/` folder
- Verify `netlify.toml` has redirect rules

### Images Not Loading

- Check image paths are relative (starting with `/`)
- Verify images are in `client/public/` or imported correctly

## Post-Deployment

1. **Update Google OAuth Redirect URLs**

   - Add your Netlify URL to Google Cloud Console
   - Format: `https://your-app.netlify.app/api/auth/google/callback`

2. **Test the Application**

   - Test all features
   - Check API connectivity
   - Verify authentication works
   - Test image uploads

3. **Set Custom Domain (Optional)**
   - Go to Domain settings in Netlify
   - Add your custom domain
   - Update DNS records

## Notes

- Netlify only hosts the frontend (React app)
- Backend must be deployed separately
- Environment variables prefixed with `VITE_` are available in the frontend
- Build output goes to `client/dist/` folder
- The `_redirects` file ensures React Router works correctly
