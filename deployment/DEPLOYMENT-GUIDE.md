# ClaudeWill.io Deployment Guide

## Option 1: GitHub Pages Deployment

1. Ensure your repository is set up for GitHub Pages:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Set the source to the 'main' branch
   - Set the folder to '/docs' or '/root'
   - Save the settings

2. If using a custom domain:
   - Add your domain in the GitHub Pages settings
   - Create a CNAME file in your repository with your domain name
   - Update your domain's DNS settings with your provider:
     - Add an A record pointing to GitHub's IP addresses
     - Or add a CNAME record pointing to `dereksimmons23.github.io`

3. To deploy, simply push changes to the main branch:
   ```bash
   ./scripts/deploy.sh
   ```

## Option 2: Traditional Web Hosting

1. Prepare your files:
   ```bash
   ./scripts/build.sh
   ```

2. Upload to your web hosting provider:
   - Use FTP or SFTP to upload the contents of the 'public' directory
   - Or use your provider's control panel to upload files

## Maintaining Your Environment

1. When switching to a new computer:
   ```bash
   # Clone the repository
   git clone git@github.com:dereksimmons23/claudewill.io.git
   
   # Run the environment setup script
   cd claudewill.io
   ./environment-setup.sh
   ```

2. Regular maintenance:
   - Keep your SSH keys secure
   - Regularly commit and push changes
   - Test your site after each deployment
