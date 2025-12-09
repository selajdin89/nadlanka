# 🚀 Complete Guide: Deploy Backend to Render (Free Tier)

This guide will walk you through deploying your Express.js backend to Render's free tier step by step.

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ Your code pushed to a GitHub repository
- ✅ A GitHub account (free)
- ✅ A MongoDB Atlas account (free tier available)

---

## Step 1: Set Up MongoDB Atlas (Free Database)

### 1.1 Create MongoDB Atlas Account

1. Go to **https://www.mongodb.com/cloud/atlas/register**
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with your email or Google account
4. Choose **"Build a database"** → **"FREE"** (M0 Sandbox)

### 1.2 Create a Free Cluster

1. Select **"AWS"** as cloud provider (or your preference)
2. Choose a region closest to you (e.g., `N. Virginia (us-east-1)`)
3. Leave cluster tier as **"M0 Sandbox"** (FREE)
4. Click **"Create Cluster"**
5. Wait 1-3 minutes for cluster to be created

### 1.3 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `nadlanka_user`)
5. Click **"Autogenerate Secure Password"** and **COPY IT** (you'll need this!)
6. Under **"Database User Privileges"**, select **"Atlas admin"**
7. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add specific IPs later)
   - This allows Render to connect to your database
4. Click **"Confirm"**

### 1.5 Get Your Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT:** Replace `<username>` with your database username and `<password>` with your password
7. Add your database name at the end (before `?`):
   ```
   mongodb+srv://nadlanka_user:your-password@cluster0.xxxxx.mongodb.net/nadlanka?retryWrites=true&w=majority
   ```
8. **SAVE THIS STRING** - you'll need it in Step 4!

---

## Step 2: Prepare Your Code (Verify Everything is Ready)

### 2.1 Make Sure Code is on GitHub

1. Open your terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd C:\Users\seloj\Desktop\cursor-app
   ```
3. Check if you have a git repository:
   ```bash
   git status
   ```
4. If not initialized, initialize it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for Render deployment"
   ```
5. Push to GitHub (if you haven't already):
   - Create a new repository on GitHub
   - Then run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### 2.2 Verify Server Files

Make sure your `server` folder contains:

- ✅ `package.json`
- ✅ `index.js`
- ✅ `models/` folder
- ✅ All necessary files

**Your server already has:**

- ✅ Health check endpoint at `/api/health` ✓
- ✅ Proper package.json with start script ✓
- ✅ Environment variable setup ✓

---

## Step 3: Create Render Account

### 3.1 Sign Up for Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"** (top right)
3. Click **"Sign Up with GitHub"**
4. Authorize Render to access your GitHub account
5. Complete your profile (optional)

---

## Step 4: Deploy Your Backend on Render

### 4.1 Create a New Web Service

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**

### 4.2 Connect Your Repository

1. If this is your first time, click **"Connect GitHub"**
2. Authorize Render to access your repositories
3. Select your repository from the list
4. Click **"Connect"**

#### ⚠️ Can't See All Your Repositories?

If you only see a few repositories (not all of them), follow these steps:

**Option 1: Re-authorize with Full Access**

1. Go to Render dashboard → Click your profile (top right)
2. Go to **"Account Settings"** → **"Connected Accounts"**
3. Click **"Disconnect"** next to GitHub
4. Click **"Connect GitHub"** again
5. When GitHub asks for permissions, make sure to:
   - Grant access to **all repositories** (or select specific ones)
   - Authorize the Render application

**Option 2: Update GitHub Permissions**

1. Go to GitHub.com → Click your profile → **"Settings"**
2. Click **"Applications"** → **"Authorized OAuth Apps"** (or **"Installed GitHub Apps"**)
3. Find **"Render"** in the list
4. Click **"Configure"** or **"Edit"**
5. Under **"Repository access"**, select:
   - **"All repositories"** (recommended), OR
   - **"Only select repositories"** → Then add your repository
6. Click **"Save"** or **"Update"**
7. Go back to Render and refresh the repository list

**Option 3: Check Repository Visibility**

- Make sure your repository exists on GitHub
- Check if it's private (Render can access private repos, but you need proper permissions)
- Verify you're logged into the correct GitHub account on Render

**After updating permissions:**

- Refresh the Render page
- The repository list should update to show all your repos

### 4.3 Configure Your Service

Fill in the following settings:

**Basic Settings:**

- **Name:** `nadlanka-backend` (or any name you prefer)
- **Region:** Choose the region closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (or `master` if that's your branch name)

**Build & Deploy:**

- **Root Directory:** `server` ⚠️ **IMPORTANT!** Make sure this is set to `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Health Check Path:**

- **Health Check Path:** `/api/health` ⚠️ **IMPORTANT!** Your server has this endpoint

**Instance Type:**

- Select **"Free"** (this is the free tier)

### 4.4 Set Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"** for each:

#### Required Variables:

1. **MONGODB_URI**

   - **Key:** `MONGODB_URI`
   - **Value:** Paste your MongoDB connection string from Step 1.5
   - Example: `mongodb+srv://nadlanka_user:password123@cluster0.xxxxx.mongodb.net/nadlanka?retryWrites=true&w=majority`

2. **JWT_SECRET**

   - **Key:** `JWT_SECRET`
   - **Value:** Generate a random secret (you can use: `openssl rand -hex 32` or any random string)
   - Example: `my-super-secret-jwt-key-12345-abcde`

3. **SESSION_SECRET**

   - **Key:** `SESSION_SECRET`
   - **Value:** Generate another random secret (different from JWT_SECRET)
   - Example: `my-session-secret-key-67890-fghij`

4. **CLIENT_URL**

   - **Key:** `CLIENT_URL`
   - **Value:** For now, use `http://localhost:3000` (we'll update this after deploying frontend to Netlify)
   - **Later:** Change to `https://your-netlify-app.netlify.app`

5. **PORT**
   - **Key:** `PORT`
   - **Value:** `10000` (Render uses port 10000 for free tier, but your server will use `process.env.PORT` automatically)
   - **Note:** Actually, you can omit this - Render sets `PORT` automatically!

#### Optional Variables (if you're using Google OAuth):

6. **GOOGLE_CLIENT_ID** (Optional)

   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** Your Google OAuth Client ID

7. **GOOGLE_CLIENT_SECRET** (Optional)
   - **Key:** `GOOGLE_CLIENT_SECRET`
   - **Value:** Your Google OAuth Client Secret

### 4.5 Deploy!

1. Scroll down and click **"Create Web Service"**
2. Wait for deployment (first deploy takes 5-10 minutes)
3. Watch the build logs - you should see:
   - ✅ Installing dependencies
   - ✅ Building...
   - ✅ Starting server
   - ✅ MongoDB Connected

### 4.6 Get Your Backend URL

Once deployment is complete:

1. You'll see a green **"Live"** status
2. At the top, you'll see your app URL:
   - Example: `https://nadlanka-backend.onrender.com`
3. **COPY THIS URL** - you'll need it for your frontend!
4. Test it by visiting: `https://your-app.onrender.com/api/health`
   - You should see: `{"message":"Server is running!","timestamp":"...","status":"healthy"}`

---

## Step 5: Update CORS Settings (If Needed)

Your server currently allows all origins. For production, you might want to restrict it to your Netlify URL. But for now, it should work fine.

**After you deploy to Netlify**, you can update the CORS in `server/index.js`:

```javascript
app.use(
	cors({
		origin: process.env.CLIENT_URL || "https://your-netlify-app.netlify.app",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	})
);
```

Then push the changes and Render will auto-deploy.

---

## Step 6: Test Your Deployed Backend

### 6.1 Test Health Endpoint

Visit: `https://your-app.onrender.com/api/health`

Expected response:

```json
{
	"message": "Server is running!",
	"timestamp": "2024-01-20T10:30:00.000Z",
	"status": "healthy"
}
```

### 6.2 Test API Endpoints

Try accessing other endpoints if you have them:

- `https://your-app.onrender.com/api/products`
- `https://your-app.onrender.com/api/users`
- etc.

---

## Step 7: Update Frontend with Backend URL

### 7.1 Update Netlify Environment Variables

When you deploy to Netlify:

1. Go to your Netlify site dashboard
2. Go to **Site settings** → **Environment variables**
3. Add/Update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-app.onrender.com`
4. Redeploy your Netlify site

### 7.2 Update Render Environment Variable

1. Go back to Render dashboard
2. Go to your web service → **Environment**
3. Update `CLIENT_URL` to your Netlify URL:
   - **Key:** `CLIENT_URL`
   - **Value:** `https://your-netlify-app.netlify.app`
4. Save changes (will trigger a redeploy)

---

## ⚠️ Important Notes About Free Tier

### Render Free Tier Limitations:

1. **Spins Down After 15 Minutes of Inactivity**

   - If no requests for 15 minutes, the service goes to sleep
   - First request after sleep takes ~30-50 seconds (cold start)
   - Subsequent requests are fast

2. **Solution for Testing:**

   - Keep pinging your health endpoint every 10-14 minutes
   - Or use a service like UptimeRobot (free) to ping it every 10 minutes

3. **File Uploads:**
   - Uploaded files are stored in `uploads/` folder
   - On free tier, these files will be lost on redeploy
   - Consider using cloud storage (AWS S3, Cloudinary) for production

---

## 🐛 Troubleshooting

### Deployment Fails

**Problem:** Build fails

- **Solution:** Check build logs in Render dashboard
- Make sure `Root Directory` is set to `server`
- Verify `package.json` has correct `start` script

### MongoDB Connection Fails

**Problem:** "MongoDB connection error"

- **Solution:**
  - Check `MONGODB_URI` is correct in environment variables
  - Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
  - Check username/password are correct (no `< >` brackets)

### Health Check Fails

**Problem:** Health check timeout

- **Solution:**
  - Verify health check path is `/api/health`
  - Check server logs for errors
  - Make sure server starts successfully

### CORS Errors

**Problem:** Frontend can't connect to backend

- **Solution:**
  - Verify `CLIENT_URL` in Render matches your Netlify URL
  - Check CORS settings in `server/index.js`
  - Make sure frontend uses correct `VITE_API_URL`

### Service Keeps Sleeping

**Problem:** First request after inactivity is slow

- **Solution:**
  - This is normal for free tier
  - Use UptimeRobot to ping `/api/health` every 10 minutes
  - Or upgrade to paid tier for always-on

---

## ✅ Checklist

Before considering deployment complete:

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database user created with password
- [ ] Network access configured (allow all IPs)
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created on Render
- [ ] Root directory set to `server`
- [ ] All environment variables set
- [ ] Health check path set to `/api/health`
- [ ] Deployment successful (green "Live" status)
- [ ] Health endpoint works: `https://your-app.onrender.com/api/health`
- [ ] MongoDB connection successful (check logs)
- [ ] Frontend updated with backend URL
- [ ] CORS configured correctly

---

## 🎉 You're Done!

Your backend is now live on Render's free tier!

**Your backend URL:** `https://your-app.onrender.com`

**Next Steps:**

1. Deploy your frontend to Netlify (see `NETLIFY_DEPLOY.md`)
2. Update `CLIENT_URL` in Render to your Netlify URL
3. Update `VITE_API_URL` in Netlify to your Render URL
4. Test your full application!

---

## 📞 Need Help?

- Check Render logs: Dashboard → Your Service → Logs
- Check MongoDB Atlas logs: Atlas Dashboard → Metrics
- Render Documentation: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
