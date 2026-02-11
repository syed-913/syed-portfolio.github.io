# GitHub Pages Deployment Guide

This guide will help you deploy your SysAdmin Portfolio to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your machine
- Your portfolio project ready to deploy

## Step 1: Update Vite Configuration

The `vite.config.ts` has been configured with the correct base path for GitHub Pages.

**Important:** Replace `'your-username'` and `'your-repo-name'` in `vite.config.ts` with your actual GitHub username and repository name.

Example:
```typescript
base: '/portfolio/', // if your repo is named 'portfolio'
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it (e.g., `portfolio` or `sysadmin-portfolio`)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)

## Step 3: Initialize Git and Push

Run these commands in your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SysAdmin Portfolio"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Save the settings

## Step 5: Deploy

The GitHub Actions workflow will automatically deploy your site when you push to the `main` branch.

To trigger the first deployment:
```bash
git push origin main
```

## Step 6: Access Your Site

After the workflow completes (check the **Actions** tab), your site will be available at:

```
https://your-username.github.io/your-repo-name/
```

## Environment Variables (Discord Webhook)

⚠️ **IMPORTANT**: Your Discord webhook URL is currently in the `.env` file, which should **NOT** be committed to GitHub for security reasons.

### Option 1: Remove Discord Integration (Recommended for Public Repo)
Comment out or remove the Discord webhook functionality from `Contact.tsx` before deploying.

### Option 2: Use GitHub Secrets (For Private Repo)
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add a new secret: `VITE_DISCORD_WEBHOOK_URL`
3. Update the workflow to use this secret

## Updating Your Site

Whenever you want to update your deployed site:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy your site.

## Troubleshooting

### Build Fails
- Check the **Actions** tab for error logs
- Ensure all dependencies are in `package.json`
- Test the build locally: `npm run build`

### 404 Errors on Routes
- Make sure `base` in `vite.config.ts` matches your repo name
- GitHub Pages uses hash-based routing for SPAs

### Site Not Updating
- Clear your browser cache
- Wait a few minutes for GitHub's CDN to update
- Check the Actions tab to ensure deployment succeeded

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file in the `public` folder with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

---

**Your portfolio is now live!** 🎉
