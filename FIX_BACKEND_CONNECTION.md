# 🔧 Fix: Frontend Not Connecting to Backend

Your frontend is live at: **https://jazzy-custard-5e2ffd.netlify.app/**
Your backend is at: **https://nadlanka.onrender.com**

## ❌ Problem
Frontend can't fetch data from backend - no products, no API calls working.

## ✅ Solution - Two Steps:

---

## Step 1: Set Environment Variable in Netlify

1. Go to **Netlify Dashboard**: https://app.netlify.com
2. Click on your site: **jazzy-custard-5e2ffd**
3. Go to **Site settings** (left sidebar)
4. Click **Environment variables** (under "Build & deploy")
5. Click **"Add a variable"** or **"Edit variables"**
6. Add/Update this variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://nadlanka.onrender.com`
7. Click **"Save"**

**⚠️ IMPORTANT:** After saving, you need to **redeploy** the site:
- Go back to **Deploys** tab
- Click **"Trigger deploy"** → **"Deploy site"**
- Wait for deployment to complete (2-3 minutes)

---

## Step 2: Update Backend CORS in Render

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **nadlanka** service
3. Go to **"Environment"** tab
4. Find **`CLIENT_URL`** variable
5. Click the **pencil/edit icon** or click on it
6. Update the value to:
   - **New Value:** `https://jazzy-custard-5e2ffd.netlify.app`
   - (Remove `http://localhost:3000`)
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 1-2 minutes)

---

## Step 3: Test Your Site

1. Wait for both deployments to complete
2. Visit your frontend: **https://jazzy-custard-5e2ffd.netlify.app/**
3. Open browser console (F12 → Console tab)
4. Check for:
   - ✅ No CORS errors
   - ✅ API calls to `https://nadlanka.onrender.com/api/...`
   - ✅ Data loading (products, categories, etc.)

---

## 🐛 Troubleshooting

### Still No Data?

1. **Check Backend Health:**
   - Visit: https://nadlanka.onrender.com/api/health
   - Should return: `{"message":"Server is running!",...}`

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for red error messages
   - Common errors:
     - `CORS policy` → Backend CORS not updated
     - `Network Error` → Backend URL wrong or backend sleeping
     - `404 Not Found` → API endpoint issue

3. **Verify Environment Variable:**
   - In Netlify: Site settings → Environment variables
   - Make sure `VITE_API_URL` = `https://nadlanka.onrender.com` (no trailing slash)

4. **Backend Sleeping (Free Tier):**
   - Render free tier spins down after 15 min inactivity
   - First request takes ~30 seconds (cold start)
   - Wait a bit, then refresh the page

---

## ✅ Quick Checklist

- [ ] `VITE_API_URL` set in Netlify to `https://nadlanka.onrender.com`
- [ ] Netlify site redeployed after setting env var
- [ ] `CLIENT_URL` updated in Render to `https://jazzy-custard-5e2ffd.netlify.app`
- [ ] Render service redeployed
- [ ] Backend health check works: https://nadlanka.onrender.com/api/health
- [ ] Frontend shows data (products, etc.)

---

**After completing these steps, your frontend should connect to the backend! 🎉**

