# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. Verify your email

## Step 2: Get Your Credentials

1. After logging in, you'll see the **Dashboard**
2. Copy these three values:
   - **Cloud Name** (e.g., `dabc123xyz`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Add Environment Variables to Render

1. Go to your Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these three variables:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

⚠️ **Important:** Replace `your-cloud-name-here`, etc. with your actual values from Cloudinary Dashboard!

## Step 4: Deploy

1. Render will automatically redeploy when you add environment variables
2. Wait for deployment to complete
3. Check logs to see: `☁️ Cloudinary configured successfully`

## What This Does

✅ **Automatic Image Compression:**
- Images are automatically optimized (quality: auto:good)
- Saves ~60-80% storage space
- Faster loading times

✅ **Automatic Format Conversion:**
- Serves WebP format when browser supports it (smaller files)
- Falls back to original format if needed

✅ **Image Resizing:**
- Maximum dimensions: 1200x1200px
- Prevents huge images from being stored
- Maintains aspect ratio

✅ **Permanent Storage:**
- Images stored permanently on Cloudinary
- Won't be lost on server restarts/redeploys
- Global CDN for fast delivery

✅ **Organization:**
- Images stored in folder: `nadlanka/products/`
- Easy to manage in Cloudinary dashboard

## Testing

1. Try uploading a new product with images
2. Check Render logs - you should see:
   ```
   📤 Uploading X file(s) to Cloudinary
   ✅ Uploaded: nadlanka/products/xxxxx
   ```
3. Images should load immediately on your site

## Free Tier Limits

- **25GB storage** (total, cumulative)
- **25GB bandwidth/month** (resets monthly)
- Perfect for testing and moderate traffic

## Troubleshooting

If images don't upload:
1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Make sure Cloudinary credentials are correct
4. Check Cloudinary dashboard for upload errors

If you see "Cloudinary not configured":
- Environment variables are missing or incorrect
- Check Render environment variables are saved
- Redeploy after adding variables

