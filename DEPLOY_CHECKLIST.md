# Quick Deployment Checklist

Follow these steps in order to deploy your portfolio to GitHub Pages with a secure Discord webhook.

## ✅ Pre-Deployment Checklist

- [ ] 1. Set up Cloudflare Worker (see `CLOUDFLARE_SETUP.md`)
- [ ] 2. Get your Cloudflare Worker URL
- [ ] 3. Update `.env` with `VITE_WEBHOOK_PROXY_URL=your-worker-url`
- [ ] 4. Test locally (`npm run build && npm run preview`)
- [ ] 5. Verify contact form works

## 🚀 Deployment Steps

### First Time Setup

```bash
# 1. Initialize git (if not done)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: SysAdmin Portfolio"

# 4. Add remote
git remote add origin https://github.com/syed-913/syed-portfolio.github.io.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to: https://github.com/syed-913/syed-portfolio.github.io/settings/pages
2. Under **Source**, select: **GitHub Actions**
3. Wait for deployment (check **Actions** tab)
4. Your site will be live at: **https://syed-913.github.io/**

### Future Updates

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

## 🔒 Security Notes

✅ **What's Protected:**
- Discord webhook URL (stored in Cloudflare Worker secrets)
- `.env` file (in `.gitignore`, never committed)

⚠️ **What's Public:**
- All your code (it's a public repo)
- Cloudflare Worker URL (but it's just a proxy, not the real webhook)

## 📝 Important Files

- `CLOUDFLARE_SETUP.md` - Complete Cloudflare Worker guide
- `DEPLOYMENT.md` - Detailed GitHub Pages deployment guide
- `.env` - Your local environment variables (NOT committed)
- `.env.example` - Template for environment variables

## 🆘 Troubleshooting

**Build fails:**
```bash
npm run build
# Check for errors
```

**Contact form doesn't work:**
- Verify Cloudflare Worker is deployed
- Check worker URL in `.env`
- Test worker directly with curl/Postman

**Site not updating:**
- Check GitHub Actions tab for deployment status
- Clear browser cache
- Wait a few minutes for CDN

## 🎉 You're Done!

Your portfolio will be live at: **https://syed-913.github.io/**
