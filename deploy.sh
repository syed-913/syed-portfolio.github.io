#!/bin/bash

# Quick Deployment Script for GitHub Pages
# This script helps you set up and deploy your portfolio

echo "🚀 GitHub Pages Deployment Setup"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .env exists and warn about it
if [ -f .env ]; then
    echo ""
    echo "⚠️  WARNING: .env file detected!"
    echo "   Make sure it's in .gitignore to avoid exposing secrets"
    echo "   Your Discord webhook URL should NOT be committed to GitHub"
    echo ""
fi

# Prompt for GitHub repository details
echo ""
read -p "Enter your GitHub username: " username
read -p "Enter your repository name: " reponame

# Update vite.config.ts
echo ""
echo "📝 Updating vite.config.ts with base path..."
sed -i "s|base: '/your-repo-name/'|base: '/$reponame/'|g" vite.config.ts
echo "✅ Updated vite.config.ts"

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Git operations
echo ""
echo "📤 Preparing to push to GitHub..."
git add .
git commit -m "Initial commit: SysAdmin Portfolio"

# Add remote
git remote add origin "https://github.com/$username/$reponame.git" 2>/dev/null || echo "Remote already exists"

# Push to GitHub
git branch -M main
git push -u origin main

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/$username/$reponame/settings/pages"
echo "2. Under 'Source', select 'GitHub Actions'"
echo "3. Wait for the workflow to complete (check Actions tab)"
echo "4. Your site will be live at: https://$username.github.io/$reponame/"
echo ""
echo "🎉 Happy deploying!"
