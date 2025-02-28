#!/bin/bash
# Build script for claudewill.io
echo "Building claudewill.io..."

# If you add a build system later (like npm), add build commands here
# For now, we'll just copy files from content to public

# Ensure public directory exists
mkdir -p public

# Copy static files
cp -r assets/* public/

echo "Build completed successfully."
