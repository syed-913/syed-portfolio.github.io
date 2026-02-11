# Cloudflare Worker Setup Guide - Discord Webhook Proxy

This guide will help you set up a **free** Cloudflare Worker to securely proxy your Discord webhook. This keeps your webhook URL hidden from the public.

**Time Required:** 5-10 minutes  
**Cost:** $0 (100% Free)  
**No Credit Card Required!**

---

## Why Use Cloudflare Workers?

✅ **Secure** - Your Discord webhook URL stays private  
✅ **Free** - 100,000 requests/day on free plan  
✅ **Fast** - Edge network, responds in milliseconds  
✅ **Simple** - No server management needed  

---

## Step 1: Create Cloudflare Account

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up)
2. Sign up with your email (no credit card needed)
3. Verify your email
4. Log in to the dashboard

---

## Step 2: Create a Worker

1. In the Cloudflare dashboard, click **Workers & Pages** in the left sidebar
2. Click **Create Application**
3. Click **Create Worker**
4. Give it a name (e.g., `discord-webhook-proxy`)
5. Click **Deploy** (don't worry about the default code, we'll replace it)

---

## Step 3: Edit the Worker Code

1. After deployment, click **Edit Code** button
2. **Delete all the existing code** in the editor
3. **Copy the entire content** from `cloudflare-worker.js` file in your project
4. **Paste it** into the Cloudflare editor
5. Click **Save and Deploy** (top right)

---

## Step 4: Add Your Discord Webhook as a Secret

This is the most important step - it keeps your webhook URL secure!

1. Go back to your worker's page (click the back arrow or go to Workers & Pages)
2. Click on your worker name (`discord-webhook-proxy`)
3. Click the **Settings** tab
4. Scroll down to **Environment Variables**
5. Click **Add variable**
6. Set:
   - **Variable name:** `DISCORD_WEBHOOK_URL`
   - **Value:** Your Discord webhook URL (from your `.env` file)
   - **Type:** Select **Secret** (this encrypts it)
7. Click **Save**

---

## Step 5: Get Your Worker URL

1. Go back to the worker overview
2. You'll see a URL like: `https://discord-webhook-proxy.YOUR-SUBDOMAIN.workers.dev`
3. **Copy this URL** - you'll need it in the next step

---

## Step 6: Update Your Portfolio Code

Now we need to tell your portfolio to use the Cloudflare Worker instead of the direct Discord webhook.

### Option A: Using Environment Variable (Recommended)

1. Open your `.env` file
2. Add a new line:
   ```
   VITE_WEBHOOK_PROXY_URL=https://discord-webhook-proxy.YOUR-SUBDOMAIN.workers.dev
   ```
   (Replace with your actual worker URL)

3. Open `src/pages/Contact.tsx`
4. Find this line (around line 22):
   ```typescript
   const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
   ```
5. Replace it with:
   ```typescript
   const webhookUrl = import.meta.env.VITE_WEBHOOK_PROXY_URL || 'https://discord-webhook-proxy.YOUR-SUBDOMAIN.workers.dev';
   ```

### Option B: Direct URL (Simpler, but less flexible)

1. Open `src/pages/Contact.tsx`
2. Find this line (around line 22):
   ```typescript
   const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
   ```
3. Replace it with:
   ```typescript
   const webhookUrl = 'https://discord-webhook-proxy.YOUR-SUBDOMAIN.workers.dev';
   ```
   (Replace with your actual worker URL)

---

## Step 7: Test Locally

1. Build your project:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

3. Go to the contact page and send a test message
4. Check your Discord channel - you should receive the message!

---

## Step 8: Deploy to GitHub Pages

Now you're ready to deploy! Your Discord webhook is secure.

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Cloudflare Worker proxy for Discord webhook"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. GitHub Actions will automatically deploy your site

---

## Troubleshooting

### "Worker not found" error
- Make sure you saved and deployed the worker code
- Check that the worker URL is correct

### "CORS error" in browser console
- The worker code includes CORS headers, so this shouldn't happen
- If it does, make sure you copied the entire worker code correctly

### Messages not appearing in Discord
- Check that the `DISCORD_WEBHOOK_URL` environment variable is set correctly in Cloudflare
- Make sure it's set as a **Secret** type
- Verify your Discord webhook URL is still valid

### "Failed to send message" error
- Check your Discord webhook URL is correct
- Make sure the Discord channel still exists
- Try regenerating the webhook in Discord settings

---

## Security Notes

✅ **Your Discord webhook URL is now secure!**
- It's stored as an encrypted secret in Cloudflare
- It never appears in your GitHub repository
- It's not visible in your website's JavaScript

⚠️ **Rate Limiting**
- Cloudflare Workers free plan: 100,000 requests/day
- More than enough for a portfolio contact form
- If you get spam, you can add rate limiting to the worker

---

## Optional: Add Rate Limiting

To prevent spam, you can add rate limiting to your worker:

1. In Cloudflare dashboard, go to your worker
2. Click **Settings** → **Triggers**
3. Enable **Rate Limiting** (free tier allows basic limits)

Or add this to your worker code (before the Discord fetch):

```javascript
// Simple rate limiting by IP
const ip = request.headers.get('CF-Connecting-IP');
const rateLimitKey = `rate-limit:${ip}`;

// Check if IP has sent too many requests (example: max 5 per hour)
// You'd need to use Cloudflare KV for this (also free tier available)
```

---

## Need Help?

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Discord Webhook Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

---

**You're all set!** 🎉 Your portfolio now has a secure contact form that sends messages to Discord.
