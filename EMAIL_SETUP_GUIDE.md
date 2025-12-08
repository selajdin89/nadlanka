# 📧 Email Setup Guide for NaDlanka

This guide will help you replace the test email service with a real SMTP service.

## 🚀 Quick Setup Options

### Option 1: Gmail SMTP (Recommended for Testing)

**Pros:** Free, reliable, easy setup
**Cons:** Limited to 500 emails/day, requires Gmail account

#### Step 1: Enable Gmail App Passwords

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and generate a password
5. Copy the 16-character password

#### Step 2: Update your `.env` file

Add these lines to your `server/.env` file:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@nadlanka.com
```

---

### Option 2: SendGrid (Recommended for Production)

**Pros:** Professional, high deliverability, 100 emails/day free
**Cons:** Requires account setup

#### Step 1: Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free account
3. Verify your email address

#### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it **Mail Send** permissions
5. Copy the API key

#### Step 3: Update your `.env` file

```env
# SendGrid Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@nadlanka.com
```

---

### Option 3: Mailgun (Good Alternative)

**Pros:** Good deliverability, 10,000 emails/month free
**Cons:** Requires domain verification for free tier

#### Step 1: Create Mailgun Account

1. Go to [Mailgun](https://www.mailgun.com/)
2. Sign up for free account
3. Verify your domain (or use sandbox for testing)

#### Step 2: Get SMTP Credentials

1. Go to **Sending** → **Domains**
2. Select your domain
3. Go to **SMTP** tab
4. Copy the credentials

#### Step 3: Update your `.env` file

```env
# Mailgun Configuration
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

---

### Option 4: AWS SES (For High Volume)

**Pros:** Very reliable, scalable, pay-per-use
**Cons:** More complex setup, requires AWS account

#### Step 1: AWS SES Setup

1. Create AWS account
2. Go to AWS SES console
3. Verify your email address
4. Create SMTP credentials

#### Step 2: Update your `.env` file

```env
# AWS SES Configuration
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASS=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## 🔧 Complete .env Configuration

Here's a complete `.env` file template:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/nadlanka

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5000

# Email Configuration
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@nadlanka.com

# Optional: For custom SMTP providers
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-key
```

---

## 🧪 Testing Your Email Setup

### Step 1: Restart Your Server

```bash
# Stop your server (Ctrl+C)
# Then restart it
npm start
```

### Step 2: Test the Contact Form

1. Go to any product page
2. Click "Contact Seller"
3. Fill out the form and send
4. Check your email inbox

### Step 3: Check Server Logs

Look for these messages in your server console:

- ✅ `Message notification email sent: [message-id]`
- ✅ `Message confirmation email sent: [message-id]`
- ❌ If you see errors, check your credentials

---

## 🚨 Troubleshooting

### Common Issues:

#### "Authentication failed"

- **Gmail:** Make sure you're using App Password, not regular password
- **Other services:** Check username/password are correct

#### "Connection timeout"

- Check if your hosting provider blocks SMTP ports
- Try different ports (465, 587, 2525)

#### "Sender address not verified"

- **AWS SES:** You need to verify sender email first
- **Mailgun:** Use sandbox domain for testing

#### "Daily quota exceeded"

- **Gmail:** 500 emails/day limit
- **SendGrid:** 100 emails/day free limit
- Consider upgrading your plan

---

## 📊 Email Service Comparison

| Service  | Free Tier | Daily Limit | Setup Difficulty | Deliverability |
| -------- | --------- | ----------- | ---------------- | -------------- |
| Gmail    | ✅        | 500 emails  | Easy             | Good           |
| SendGrid | ✅        | 100 emails  | Medium           | Excellent      |
| Mailgun  | ✅        | 10k/month   | Medium           | Excellent      |
| AWS SES  | ❌        | Pay-per-use | Hard             | Excellent      |

---

## 🎯 Recommended Setup for Different Stages

### Development/Testing

- **Gmail SMTP** - Quick and easy setup

### Production (Small Scale)

- **SendGrid** - Professional, reliable, good free tier

### Production (Large Scale)

- **AWS SES** or **Mailgun** - High volume, best deliverability

---

## 🔒 Security Notes

1. **Never commit `.env` files** to version control
2. **Use App Passwords** for Gmail, not regular passwords
3. **Rotate API keys** regularly
4. **Monitor email usage** to avoid quota limits
5. **Set up email monitoring** for production

---

## 📞 Need Help?

If you encounter issues:

1. Check server logs for specific error messages
2. Verify your email credentials
3. Test with a simple email first
4. Check your email service provider's documentation

Good luck with your email setup! 🚀
