#!/bin/bash
# ClaudeWill.io Environment Setup Script
# This script helps maintain consistent development environment
# including SSH keys and git configuration

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Project directory
PROJECT_DIR="$HOME/Desktop/claudewill.io"
SSH_DIR="$PROJECT_DIR/.ssh"
GITHUB_REPO="git@github.com:dereksimmons23/claudewill.io.git"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check and create directories
create_directories() {
    echo -e "${BLUE}Checking project directories...${RESET}"
    
    # Create main project directory if it doesn't exist
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}Creating project directory at $PROJECT_DIR${RESET}"
        mkdir -p "$PROJECT_DIR"
    fi
    
    # Create SSH directory if it doesn't exist
    if [ ! -d "$SSH_DIR" ]; then
        echo -e "${YELLOW}Creating SSH directory at $SSH_DIR${RESET}"
        mkdir -p "$SSH_DIR"
    fi
    
    # Create basic project structure
    mkdir -p "$PROJECT_DIR/assets/css"
    mkdir -p "$PROJECT_DIR/assets/js"
    mkdir -p "$PROJECT_DIR/assets/images"
    mkdir -p "$PROJECT_DIR/content/framework"
    mkdir -p "$PROJECT_DIR/content/book-excerpts"
    mkdir -p "$PROJECT_DIR/content/personal"
    mkdir -p "$PROJECT_DIR/content/standard-correspondence"
    mkdir -p "$PROJECT_DIR/public"
    mkdir -p "$PROJECT_DIR/deployment/configs"
    mkdir -p "$PROJECT_DIR/docs"
    mkdir -p "$PROJECT_DIR/scripts"
    
    echo -e "${GREEN}Directory structure created successfully.${RESET}"
}

# Function to check and setup SSH keys
setup_ssh_keys() {
    echo -e "${BLUE}Checking SSH keys...${RESET}"
    
    # Check if SSH keys exist
    if [ ! -f "$SSH_DIR/id_rsa" ] || [ ! -f "$SSH_DIR/id_rsa.pub" ]; then
        echo -e "${YELLOW}SSH keys not found. Checking for keys in default location...${RESET}"
        
        # Check if keys exist in default SSH directory
        if [ -f "$HOME/.ssh/id_rsa" ] && [ -f "$HOME/.ssh/id_rsa.pub" ]; then
            echo -e "${YELLOW}Found keys in default location. Copying to project...${RESET}"
            cp "$HOME/.ssh/id_rsa" "$SSH_DIR/id_rsa"
            cp "$HOME/.ssh/id_rsa.pub" "$SSH_DIR/id_rsa.pub"
            chmod 600 "$SSH_DIR/id_rsa"
            chmod 644 "$SSH_DIR/id_rsa.pub"
        else
            echo -e "${YELLOW}No existing SSH keys found. Would you like to create new ones? (y/n)${RESET}"
            read -r create_keys
            
            if [ "$create_keys" = "y" ] || [ "$create_keys" = "Y" ]; then
                echo -e "${YELLOW}Creating new SSH keys...${RESET}"
                ssh-keygen -t rsa -b 4096 -C "derek@claudewill.io" -f "$SSH_DIR/id_rsa"
                echo -e "${GREEN}SSH keys created successfully.${RESET}"
                echo -e "${YELLOW}Please add the following public key to your GitHub account:${RESET}"
                cat "$SSH_DIR/id_rsa.pub"
                echo -e "${YELLOW}Press Enter once you've added the key to GitHub...${RESET}"
                read -r
            else
                echo -e "${RED}SSH keys are required for GitHub integration. Setup cannot continue.${RESET}"
                exit 1
            fi
        fi
    else
        echo -e "${GREEN}SSH keys found in project directory.${RESET}"
    fi
    
    # Set proper permissions
    chmod 600 "$SSH_DIR/id_rsa"
    chmod 644 "$SSH_DIR/id_rsa.pub"
    
    # Add key to SSH agent
    echo -e "${BLUE}Adding SSH key to agent...${RESET}"
    if command_exists ssh-agent; then
        eval "$(ssh-agent -s)"
        ssh-add "$SSH_DIR/id_rsa"
        echo -e "${GREEN}SSH key added to agent.${RESET}"
    else
        echo -e "${YELLOW}ssh-agent not available. Skipping this step.${RESET}"
    fi
}

# Function to setup Git configuration
setup_git() {
    echo -e "${BLUE}Setting up Git configuration...${RESET}"
    
    # Check if Git is installed
    if ! command_exists git; then
        echo -e "${RED}Git is not installed. Please install Git and run this script again.${RESET}"
        exit 1
    fi
    
    # Navigate to project directory
    cd "$PROJECT_DIR" || exit
    
    # Check if git is already initialized
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}Initializing Git repository...${RESET}"
        git init
        
        # Create .gitignore
        echo -e "${YELLOW}Creating .gitignore file...${RESET}"
        cat > .gitignore << EOL
# SSH Keys (never commit these!)
.ssh/id_rsa
.ssh/id_rsa.pub

# Environment variables
.env

# Node modules
node_modules/

# Build files
dist/
build/

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
EOL
        
        # Create README
        echo -e "${YELLOW}Creating README.md file...${RESET}"
        cat > README.md << EOL
# ClaudeWill.io

The digital home for The CW Standard - a framework built on three decades in media, a lifetime in athletics, and generations of wisdom.

## Project Overview
ClaudeWill.io serves as the platform for "The CW Standard" framework with four core elements: 
- Pattern Recognition
- Natural Development
- Authentic Relationships
- Integrated Experience

## Development Status
This project is currently in active development.

## Contact
For more information, contact derek@claudewill.io
EOL
    else
        echo -e "${GREEN}Git repository already initialized.${RESET}"
    fi
    
    # Setup Git user if not already configured
    if [ -z "$(git config user.name)" ]; then
        echo -e "${YELLOW}Setting up Git user name...${RESET}"
        git config user.name "Derek Simmons"
    fi
    
    if [ -z "$(git config user.email)" ]; then
        echo -e "${YELLOW}Setting up Git user email...${RESET}"
        git config user.email "derek@claudewill.io"
    fi
    
    # Check if remote origin exists
    if ! git remote | grep -q "origin"; then
        echo -e "${YELLOW}Adding remote origin...${RESET}"
        git remote add origin "$GITHUB_REPO"
    fi
    
    echo -e "${GREEN}Git configuration completed.${RESET}"
}

# Function to create deployment scripts
create_deployment_scripts() {
    echo -e "${BLUE}Creating deployment scripts...${RESET}"
    
    # Create build script
    cat > "$PROJECT_DIR/scripts/build.sh" << EOL
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
EOL
    chmod +x "$PROJECT_DIR/scripts/build.sh"
    
    # Create deploy script
    cat > "$PROJECT_DIR/scripts/deploy.sh" << EOL
#!/bin/bash
# Deployment script for claudewill.io
echo "Deploying claudewill.io..."

# Run build script first
./scripts/build.sh

# Commit changes
git add .
git commit -m "Update site content: \$(date)"

# Push to GitHub
git push origin main

echo "Deployment completed successfully."
EOL
    chmod +x "$PROJECT_DIR/scripts/deploy.sh"
    
    echo -e "${GREEN}Deployment scripts created successfully.${RESET}"
}

# Function to create deployment guide
create_deployment_guide() {
    echo -e "${BLUE}Creating deployment guide...${RESET}"
    
    cat > "$PROJECT_DIR/deployment/DEPLOYMENT-GUIDE.md" << EOL
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
     - Or add a CNAME record pointing to \`dereksimmons23.github.io\`

3. To deploy, simply push changes to the main branch:
   \`\`\`bash
   ./scripts/deploy.sh
   \`\`\`

## Option 2: Traditional Web Hosting

1. Prepare your files:
   \`\`\`bash
   ./scripts/build.sh
   \`\`\`

2. Upload to your web hosting provider:
   - Use FTP or SFTP to upload the contents of the 'public' directory
   - Or use your provider's control panel to upload files

## Maintaining Your Environment

1. When switching to a new computer:
   \`\`\`bash
   # Clone the repository
   git clone git@github.com:dereksimmons23/claudewill.io.git
   
   # Run the environment setup script
   cd claudewill.io
   ./environment-setup.sh
   \`\`\`

2. Regular maintenance:
   - Keep your SSH keys secure
   - Regularly commit and push changes
   - Test your site after each deployment
EOL
    
    echo -e "${GREEN}Deployment guide created successfully.${RESET}"
}

# Function to verify GitHub connection
verify_github_connection() {
    echo -e "${BLUE}Verifying GitHub connection...${RESET}"
    
    # Test SSH connection to GitHub
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo -e "${GREEN}GitHub connection successful.${RESET}"
    else
        echo -e "${RED}GitHub connection failed. Please check your SSH keys and GitHub account.${RESET}"
        echo -e "${YELLOW}Make sure you've added the public key to your GitHub account.${RESET}"
        echo -e "${YELLOW}Public key:${RESET}"
        cat "$SSH_DIR/id_rsa.pub"
    fi
}

# Function to show next steps
show_next_steps() {
    echo -e "\n${BLUE}=== Next Steps ===${RESET}"
    echo -e "${GREEN}1. Navigate to your project directory:${RESET}"
    echo -e "   cd $PROJECT_DIR"
    echo -e ""
    echo -e "${GREEN}2. Start adding content to your website:${RESET}"
    echo -e "   - Create HTML files in the public directory"
    echo -e "   - Add CSS styles in assets/css"
    echo -e "   - Add JavaScript in assets/js"
    echo -e ""
    echo -e "${GREEN}3. Commit and push your changes:${RESET}"
    echo -e "   git add ."
    echo -e "   git commit -m \"Initial content\""
    echo -e "   git push -u origin main"
    echo -e ""
    echo -e "${GREEN}4. To deploy your website:${RESET}"
    echo -e "   ./scripts/deploy.sh"
    echo -e ""
    echo -e "${YELLOW}For more detailed instructions, refer to:${RESET}"
    echo -e "   $PROJECT_DIR/deployment/DEPLOYMENT-GUIDE.md"
    echo -e ""
}

# Main execution
echo -e "${BLUE}=== ClaudeWill.io Environment Setup ===${RESET}"
create_directories
setup_ssh_keys
setup_git
create_deployment_scripts
create_deployment_guide
verify_github_connection
show_next_steps

echo -e "${GREEN}Environment setup complete!${RESET}"
