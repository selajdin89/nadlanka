# 🔧 Debug: Backend 500 Errors

Your frontend is connecting to the backend, but getting 500 errors. This usually means:
- MongoDB connection issue
- Database query failing
- Missing data

## 🔍 Step 1: Check Render Logs

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **nadlanka** service
3. Click **"Logs"** tab
4. Look for recent errors (red text)
5. Common errors you might see:
   - `MongoDB connection error`
   - `MongooseError`
   - `CastError`
   - `TypeError`

**Copy the error message** and share it with me!

---

## 🔍 Step 2: Test Backend Directly

Visit these URLs in your browser:

1. **Health Check:**
   - https://nadlanka.onrender.com/api/health
   - Should return: `{"message":"Server is running!",...}`

2. **Test Products API:**
   - https://nadlanka.onrender.com/api/products
   - Check what error you get

3. **Test Users API:**
   - https://nadlanka.onrender.com/api/users
   - Check what error you get

---

## 🔍 Step 3: Common Issues & Fixes

### Issue 1: MongoDB Not Connected

**Error in logs:** `MongoDB connection error` or `MongooseServerSelectionError`

**Fix:**
1. Check `MONGODB_URI` in Render environment variables
2. Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
3. Check MongoDB Atlas connection string is correct

### Issue 2: Database is Empty

**Error:** No error, but queries return empty

**Fix:** Your database might be empty! You need to add some test data:
- Create a test user
- Create a test product
- Or run seed scripts (if you have them)

### Issue 3: MongoDB Query Error

**Error in logs:** `CastError` or `TypeError`

**Fix:** This usually means:
- Wrong data type in database
- Missing required fields
- Schema mismatch

---

## 🚀 Quick Test: Add Some Test Data

If your database is empty, you can test by:

1. **Register a test user** from your frontend
2. **Create a test product** from your frontend
3. Then try loading products again

Or check if you have seed scripts in your server folder.

---

## 📝 Next Steps

1. **Check Render logs** and share the error
2. **Test backend URLs** directly
3. **Verify MongoDB connection** in Render logs
4. **Check if database has data**

Let me know what you find in the Render logs!

