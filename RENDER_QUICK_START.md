# ⚡ Render Deployment - Quick Reference

## 🎯 Quick Checklist

### Step 1: MongoDB Atlas Setup
- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user (save password!)
- [ ] Allow network access (0.0.0.0/0)
- [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/nadlanka?retryWrites=true&w=majority`

### Step 2: Render Setup
- [ ] Sign up at https://render.com (with GitHub)
- [ ] New → Web Service → Connect GitHub repo
- [ ] Configure:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Health Check Path: `/api/health`
  - Instance Type: **Free**

### Step 3: Environment Variables (Set in Render)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nadlanka?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-here
SESSION_SECRET=your-random-secret-here
CLIENT_URL=http://localhost:3000 (update later to Netlify URL)
```

### Step 4: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Test: `https://your-app.onrender.com/api/health`
- [ ] Copy your backend URL for Netlify

---

## 🔗 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Full Guide:** See `RENDER_DEPLOY_GUIDE.md`

---

## 📝 Generate Secrets (Command Line)

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -hex 32
```

Or use any random string generator online.

---

## ⚠️ Free Tier Notes

- **Spins down after 15 min inactivity** (~30s cold start)
- **Keep it awake:** Use UptimeRobot (free) to ping `/api/health` every 10 min
- **File uploads:** Will be lost on redeploy (use cloud storage for production)

---

**For detailed instructions, see `RENDER_DEPLOY_GUIDE.md`**

