# Email setup (verification & notifications)

Verification emails (and other emails from the app) **are only sent when real SMTP is configured**. If `EMAIL_USER` and `EMAIL_PASS` are not set correctly, users will not receive any email.

## Why you're not receiving verification emails

- The server uses **real SMTP** only when one of these is true:
  - **Gmail:** `EMAIL_USER` is a `@gmail.com` address and `EMAIL_PASS` is set.
  - **Other provider:** `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS` are set.
- Without that, the app does not send to real inboxes, so the verification link never arrives.

## Fix: configure email on the server

### Option 1: Gmail (good for small apps / staging)

1. Use a Gmail address for `EMAIL_USER`.
2. Do **not** use your normal Gmail password. Use an **App Password**:
   - Go to [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords).
   - Create an app password for “Mail” and use that as `EMAIL_PASS`.
3. In your server `.env` (or hosting env vars, e.g. Render):

   ```env
   EMAIL_USER=yourname@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

4. Restart the server. Then use “Resend verification email” in the app; you should get the email (check spam the first time).

### Option 2: Other SMTP (e.g. SendGrid, Mailgun, your host)

1. In `.env` set:

   ```env
   EMAIL_USER=your-smtp-username
   EMAIL_PASS=your-smtp-password
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   ```

2. For port 465 use `EMAIL_SECURE=true`. Optional: `EMAIL_FROM=noreply@yourdomain.com`.

## After configuring

- **Resend** in the app: click “Send email again for verification” in the blue banner. If something is wrong, the banner will show an error (e.g. “Verification emails are not configured”).
- **New signups**: new registrations (form or Google) will receive the verification email once the server has the correct env vars and has been restarted.
