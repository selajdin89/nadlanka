# 🔐 How to Make Yourself an Admin

There are several ways to make yourself an admin in the database. Choose the method that works best for you.

## Method 1: Using the Script (Easiest) ⭐

I've created a script that makes this super easy!

### Steps:

1. **Open your terminal/command prompt** in the project root directory

2. **Navigate to the server directory:**

   ```bash
   cd server
   ```

3. **Run the script with your email:**

   ```bash
   node make-admin.js your-email@example.com
   ```

   Replace `your-email@example.com` with the email you used to register on the site.

4. **The script will:**
   - Connect to your MongoDB database
   - Find your user by email
   - Update your role to "admin"
   - Show you a confirmation message

### Example:

```bash
cd server
node make-admin.js john@example.com
```

**Output:**

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB: cluster0.xxxxx.mongodb.net
📦 Database: test

✅ Successfully updated user to admin!
   Email: john@example.com
   Name: John Doe
   Previous Role: user
   New Role: admin

🎉 You can now access the admin dashboard at http://localhost:3000/admin

✅ Database connection closed
```

---

## Method 2: Using MongoDB Compass (GUI)

If you prefer a visual interface:

1. **Download MongoDB Compass** (if you don't have it):

   - https://www.mongodb.com/try/download/compass

2. **Connect to your database:**

   - Use your `MONGODB_URI` from your `.env` file
   - Or connect using: `mongodb+srv://username:password@cluster.mongodb.net/test`

3. **Navigate to the `users` collection**

4. **Find your user:**

   - Click on the "users" collection
   - Use the filter: `{ "email": "your-email@example.com" }`

5. **Edit the document:**
   - Click on your user document
   - Find the `role` field (or add it if it doesn't exist)
   - Change the value to: `"admin"`
   - Click "Update"

---

## Method 3: Using MongoDB Shell (mongosh)

If you have MongoDB shell installed:

1. **Connect to your database:**

   ```bash
   mongosh "your-mongodb-connection-string"
   ```

2. **Switch to your database:**

   ```javascript
   use test
   ```

3. **Update your user:**

   ```javascript
   db.users.updateOne(
   	{ email: "your-email@example.com" },
   	{ $set: { role: "admin" } }
   );
   ```

4. **Verify the update:**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" });
   ```

---

## Method 4: Using MongoDB Atlas Web Interface

If you're using MongoDB Atlas:

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com

2. **Navigate to your cluster:**

   - Click "Browse Collections"
   - Select your database (usually "test")
   - Click on the "users" collection

3. **Find and edit your user:**
   - Use the filter/search to find your user by email
   - Click on the document
   - Edit the `role` field to `"admin"`
   - Click "Update"

---

## ✅ Verify You're an Admin

After making yourself an admin:

1. **Log out and log back in** (to refresh your session)

2. **Navigate to:** http://localhost:3000/admin

3. **You should see the admin dashboard!**

If you get redirected or see an error, make sure:

- You logged out and logged back in
- Your user's `role` field is set to `"admin"` (not `"user"` or empty)
- The database connection is working

---

## 🔍 Troubleshooting

### Script says "User not found"

- Make sure you're using the exact email you registered with
- Check if the email has any typos
- The script will show you all available users if it can't find yours

### Script says "MONGODB_URI not found"

- Make sure you have a `.env` file in the `server` directory
- Make sure it contains: `MONGODB_URI=your-connection-string`
- The script needs to be run from the `server` directory

### Still can't access admin dashboard

- Make sure you **logged out and logged back in** after making yourself admin
- Clear your browser cache/localStorage
- Check the browser console for any errors

---

## 📝 Quick Reference

**Script location:** `server/make-admin.js`

**Command:**

```bash
cd server
node make-admin.js your-email@example.com
```

**MongoDB Query (if using shell):**

```javascript
db.users.updateOne(
	{ email: "your-email@example.com" },
	{ $set: { role: "admin" } }
);
```
