# Deployment Guide for ClaudeWill.io

This guide will help you deploy the ClaudeWill.io website to your hosting provider.

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

1. Create a new GitHub repository named `claudewill.io`
2. Push all files from the `claudewill-io` folder to this repository
3. Go to repository Settings > Pages
4. Select the main branch as the source
5. Save the settings and GitHub Pages will deploy your site

### Option 3: Netlify/Vercel

1. Create an account on Netlify or Vercel if you don't have one
2. Create a new project
3. Connect to your GitHub repository or upload files directly
4. Configure your domain in the site settings
5. Deploy the site

## Post-Deployment Tasks

1. **Update Images**: Replace the placeholder image with actual images
   - Hero background: Replace `images/placeholder.svg` with a high-quality image of the Flint Hills
   - CW photo: Add a photo to the "Legacy of Wisdom" section

2. **Configure Domain**:
   - Point the claudewill.io domain to your hosting
   - Set up SSL certificate for secure https connection

3. **Test Website**:
   - Check all links are working
   - Verify the site looks good on different devices
   - Test contact form functionality

## Future Development

For the next phase of development, consider:

1. Adding more content pages for:
   - About/Bio page
   - Detailed framework documentation
   - Services offering
   
2. Implementing a content management system for:
   - Blog updates
   - Portfolio additions
   - Case studies

3. Enhancing the site with:
   - Contact form
   - Newsletter signup
   - Interactive framework visualization

## Need Help?

For assistance with deployment, contact your web hosting provider's support or reach out to a web developer familiar with your chosen hosting platform.