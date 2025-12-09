# 🚀 Deploy Frontend to Netlify - Step by Step Guide

Your backend is already deployed at: **https://nadlanka.onrender.com**

Now let's deploy your React frontend to Netlify!

---

## 📋 Quick Checklist

- ✅ Backend deployed on Render: `https://nadlanka.onrender.com`
- ✅ `netlify.toml` configured
- ✅ `_redirects` file exists
- ✅ API config ready

---

## Step 1: Sign Up / Login to Netlify

1. Go to **https://app.netlify.com**
2. Click **"Sign up"** (or **"Log in"** if you have an account)
3. Choose **"Sign up with GitHub"** (recommended - easiest!)
4. Authorize Netlify to access your GitHub account

---

## Step 2: Connect Your Repository

1. In Netlify dashboard, click **"Add new site"** (top right)
2. Select **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. If prompted, authorize Netlify to access your repositories
5. **Find and select your repository**: `selajdin89/nadlanka`
6. Click **"Configure"** or **"Next"**

---

## Step 3: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify these:

### Build Settings:

- **Base directory:** `client`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist` (this is relative to base directory, so it's `client/dist`)

**⚠️ Important:** These should be pre-filled from your `netlify.toml` file. If they're empty, fill them in manually.

---

## Step 4: Set Environment Variable (CRITICAL!)

**Before clicking "Deploy site":**

1. Scroll down to **"Environment variables"** section
2. Click **"New variable"**
3. Add this variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://nadlanka.onrender.com`
4. Click **"Add variable"**

**This tells your frontend where to find your backend API!**

---

## Step 5: Deploy!

1. Click the big **"Deploy site"** button
2. Wait for deployment (usually 2-5 minutes)
3. Watch the build logs in real-time
4. You'll see progress like:
   - Installing dependencies...
   - Building for production...
   - Publishing...

---

## Step 6: Get Your Site URL

Once deployment completes:

1. You'll see **"Site is live"** message
2. Your site URL will be shown (something like):
   - `https://nadlanka-xxxxx.netlify.app`
   - Or a custom name if you set one
3. **Copy this URL!**

---

## Step 7: Update Backend CORS Settings

Now update your Render backend to allow requests from your Netlify URL:

1. Go back to **Render dashboard**: https://dashboard.render.com
2. Click on your **nadlanka** service
3. Go to **"Environment"** tab
4. Find **`CLIENT_URL`** variable
5. Click **"Edit"** (or update it)
6. Change the value to your Netlify URL:
   - Old: `http://localhost:3000`
   - New: `https://your-app-name.netlify.app`
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 1-2 minutes)

---

## Step 8: Test Your Full Application! 🎉

1. Open your Netlify URL in a browser
2. Test these features:
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Try to register/login
   - ✅ Browse products (if any)
   - ✅ API calls work (check browser console for errors)

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Problem:** CORS errors or API calls failing

**Solution:**
1. Verify `VITE_API_URL` is set correctly in Netlify
2. Verify `CLIENT_URL` in Render matches your Netlify URL
3. Check browser console (F12) for errors
4. Redeploy both frontend and backend after changing env vars

### 404 Errors on Routes

**Problem:** React Router routes show 404

**Solution:**
- The `_redirects` file should handle this automatically
- Verify it exists in `client/public/_redirects`
- Should contain: `/*    /index.html   200`

### Build Fails on Netlify

**Problem:** Build errors in Netlify logs

**Solution:**
1. Check build logs in Netlify dashboard
2. Common issues:
   - Missing dependencies (check `package.json`)
   - Syntax errors (check for typos)
   - Environment variable issues

### Backend Not Responding

**Problem:** Frontend shows errors connecting to backend

**Solution:**
1. Test backend directly: `https://nadlanka.onrender.com/api/health`
2. If backend is sleeping (free tier), wait ~30 seconds for first request
3. Check Render logs for errors
4. Verify MongoDB connection in Render logs

---

## ✅ Final Checklist

- [ ] Frontend deployed to Netlify
- [ ] `VITE_API_URL` set in Netlify to `https://nadlanka.onrender.com`
- [ ] `CLIENT_URL` updated in Render to your Netlify URL
- [ ] Site loads without errors
- [ ] API calls work (test a feature)
- [ ] No CORS errors in browser console

---

## 🎯 Your URLs

After deployment, you'll have:

- **Frontend:** `https://your-app-name.netlify.app`
- **Backend:** `https://nadlanka.onrender.com`
- **Health Check:** `https://nadlanka.onrender.com/api/health`

---

## 📝 Notes

- **Free Tier Limits:**
  - Netlify: 100GB bandwidth/month (plenty for testing!)
  - Render: Spins down after 15 min inactivity

- **Keep Backend Awake (Optional):**
  - Use UptimeRobot (free) to ping `/api/health` every 10 minutes
  - Sign up at https://uptimerobot.com

- **Custom Domain (Optional):**
  - Netlify allows custom domains on free tier
  - Go to Site settings → Domain management

---

## 🚀 You're Ready!

Follow the steps above and your full application will be live!

**Questions?** Check the troubleshooting section or review the logs in Netlify/Render dashboards.

