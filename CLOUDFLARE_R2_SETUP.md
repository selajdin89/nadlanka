# Cloudflare R2 Setup Guide

## Why Cloudflare R2 for High Volume?

✅ **Free Tier:**
- 10GB storage
- 1M Class A operations/month (uploads/updates)
- Unlimited Class B operations (reads/downloads)

✅ **After Free Tier (Very Cheap):**
- $0.015/GB/month storage (~$0.15 for 10GB extra)
- **No egress fees** (unlike AWS S3)
- $4.50 per million Class A operations
- Free reads (Class B operations)

✅ **Benefits:**
- S3-compatible API (easy integration)
- Global CDN via Cloudflare (free)
- Perfect for high-traffic sites
- Cost-effective for marketplace with daily uploads

## Setup Steps:

### 1. Create Cloudflare Account
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for free account

### 2. Create R2 Bucket
1. In Cloudflare Dashboard → R2 → Create bucket
2. Name your bucket (e.g., `nadlanka-images`)
3. Choose location closest to your users
4. Create bucket

### 3. Get API Credentials
1. Go to R2 → Manage R2 API Tokens
2. Create API Token
3. Select "Edit" permissions
4. Copy:
   - **Account ID**
   - **Access Key ID**
   - **Secret Access Key**

### 4. Set Environment Variables in Render
Add these to your Render environment variables:
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=nadlanka-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev (or custom domain)
```

### 5. Enable Public Access (Optional)
- In R2 bucket settings → Public Access
- Enable and get public URL
- Or set up custom domain via Cloudflare

## Cost Estimate for High Volume:

**Example: 100 products/day, 3 images each, 2MB each**
- Daily: 600MB uploads
- Monthly: ~18GB storage
- After free tier: ~$0.12/month for 8GB extra
- **Total: ~$0.12-0.50/month** (extremely cheap!)

Compare to Cloudinary:
- Same scenario: ~18GB bandwidth = $0.72/month + storage
- **R2 is much cheaper for high volume!**

