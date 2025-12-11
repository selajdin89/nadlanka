# 🔧 Fix: Google OAuth redirect_uri_mismatch Error

You're getting `Error 400: redirect_uri_mismatch` because the redirect URI in Google Cloud Console doesn't match what your app is sending.

## ✅ Fix Steps

### Step 1: Check What URL Your App is Using

Your app is sending this redirect URI:
```
https://nadlanka.onrender.com/api/auth/google/callback
```

### Step 2: Add This to Google Cloud Console

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com
   - Select your project

2. **Navigate to Credentials:**
   - Click **"APIs & Services"** (left sidebar)
   - Click **"Credentials"**
   - Find your **OAuth 2.0 Client ID** (the one with your Google Client ID)
   - Click the **pencil/edit icon** to edit it

3. **Add Authorized Redirect URIs:**
   - Scroll down to **"Authorized redirect URIs"**
   - Click **"+ ADD URI"**
   - Add this exact URL:
     ```
     https://nadlanka.onrender.com/api/auth/google/callback
     ```
   - Click **"SAVE"**

### Step 3: Verify Render Environment Variables

In Render Dashboard → your service → Environment tab:

1. **`SERVER_URL`** should be:
   ```
   https://nadlanka.onrender.com
   ```

2. **`CLIENT_URL`** should be:
   ```
   https://nadlanka.netlify.app
   ```

3. **`GOOGLE_CLIENT_ID`** - Your Google Client ID

4. **`GOOGLE_CLIENT_SECRET`** - Your Google Client Secret

### Step 4: Test Again

1. Wait a few minutes for Google to update (sometimes takes 5-10 minutes)
2. Visit: https://nadlanka.netlify.app/login
3. Click "Sign in with Google"
4. Should work now!

---

## 📝 Common Redirect URIs to Add

For production, you typically need:

1. **Production backend:**
   ```
   https://nadlanka.onrender.com/api/auth/google/callback
   ```

2. **Local development (if testing locally):**
   ```
   http://localhost:5000/api/auth/google/callback
   ```

---

## ⚠️ Important Notes

- The redirect URI must match **exactly** (including `https://` vs `http://`)
- No trailing slashes
- Google sometimes takes 5-10 minutes to update redirect URIs
- Make sure you're editing the correct OAuth Client ID

---

## 🐛 Still Not Working?

1. **Check Render logs:**
   - Look for what callback URL is being used
   - Should see: `Using callback URL: https://nadlanka.onrender.com/api/auth/google/callback`

2. **Check browser console:**
   - Press F12 → Console
   - Look for any errors

3. **Verify the redirect URI in Google Console:**
   - Make sure it's exactly: `https://nadlanka.onrender.com/api/auth/google/callback`
   - No extra spaces or characters

