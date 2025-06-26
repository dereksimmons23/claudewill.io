#!/bin/bash

# Resume Engine Deployment Script
# Builds and deploys to GitHub Pages

echo "🚀 Building Resume CI/CD Engine..."

# Build the project
npm run build

echo "✅ Build complete!"

# Create deployment package
echo "📦 Creating deployment package..."

# Copy important files to dist
cp README.md dist/
cp package.json dist/

echo "🌐 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Initialize git repository: git init"
echo "2. Add GitHub remote: git remote add origin [your-repo-url]"
echo "3. Deploy to GitHub Pages: npm run deploy"
echo ""
echo "Or deploy to Netlify by dragging the 'dist' folder to netlify.com/drop"
