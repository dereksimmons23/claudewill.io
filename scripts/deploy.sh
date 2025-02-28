#!/bin/bash
# Deployment script for claudewill.io
echo "Deploying claudewill.io..."

# Run build script first
./scripts/build.sh

# Commit changes
git add .
git commit -m "Update site content: $(date)"

# Push to GitHub
git push origin main

echo "Deployment completed successfully."
