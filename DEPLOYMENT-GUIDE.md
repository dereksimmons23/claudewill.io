# Deployment Guide for ClaudeWill.io

This guide will help you deploy the ClaudeWill.io website to your hosting provider.

## Prerequisites

- A GitHub account
- A hosting provider account (if using traditional web hosting)
- Git installed on your local machine

## Files Overview
- `index.html` - The main homepage
- `images/` - Directory containing images for the site
  - `placeholder.svg` - Placeholder image for the hero section (replace with actual image)

## Deployment Steps

### Option 1: Traditional Web Hosting (cPanel, etc.)

1. Log in to your hosting provider's control panel
2. Navigate to File Manager or FTP client
3. Create a directory for your domain if not already created
4. Upload all files from the `claudewill-io` folder to your server
5. Make sure the files are in the correct root directory (usually `public_html` or `www`)
6. Verify that the permissions are set correctly:
   - HTML files: 644
   - Directories: 755
   - Images: 644

### Option 2: GitHub Pages

1. Clone the existing repository:
   ```sh
   git clone https://github.com/yourusername/claudewill.io.git
   cd claudewill.io