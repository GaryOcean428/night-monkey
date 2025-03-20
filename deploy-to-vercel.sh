#!/bin/bash
# Night Monkey - Vercel Deployment Script
# This script helps deploy the application to Vercel

set -e # Exit on error

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

# Header
echo -e "${BOLD}Night Monkey - Vercel Deployment Script${RESET}"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Error: Vercel CLI is not installed.${RESET}"
  echo "Installing Vercel CLI globally..."
  npm install -g vercel
fi

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: No .env file found.${RESET}"
  echo "Creating .env file from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file from template.${RESET}"
    echo -e "${YELLOW}Please edit .env and add your API keys before proceeding.${RESET}"
    echo "Press ENTER when ready to continue, or CTRL+C to abort."
    read
  else
    echo -e "${RED}Error: No .env.example file found.${RESET}"
    echo "Please create a .env file with your OPENAI_API_KEY before deploying."
    exit 1
  fi
fi

# Verify OpenAI API key
if grep -q "OPENAI_API_KEY=" .env; then
  OPENAI_API_KEY=$(grep "OPENAI_API_KEY=" .env | cut -d '=' -f2)
  if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "sk-your-api-key" ]; then
    echo -e "${RED}Error: Invalid OpenAI API key in .env file.${RESET}"
    echo "Please update your OPENAI_API_KEY in the .env file."
    exit 1
  fi
else
  echo -e "${RED}Error: OPENAI_API_KEY not found in .env file.${RESET}"
  echo "Please add your OPENAI_API_KEY to the .env file."
  exit 1
fi

# Run pre-deployment checks
echo -e "\n${BOLD}Running pre-deployment checks...${RESET}"
echo "--------------------------------"

# Check for git repo
if [ ! -d .git ]; then
  echo -e "${RED}Error: Not a git repository.${RESET}"
  echo "Vercel deployment works best with a git repository."
  echo "Would you like to initialize a git repository? (y/n)"
  read init_git
  if [[ $init_git == "y" ]]; then
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
    echo -e "${GREEN}Git repository initialized.${RESET}"
  else
    echo -e "${YELLOW}Continuing without git repository...${RESET}"
  fi
fi

# Check for package.json
if [ ! -f package.json ]; then
  echo -e "${RED}Error: package.json not found.${RESET}"
  echo "Make sure you're in the correct directory."
  exit 1
else
  echo -e "${GREEN}✓ package.json found${RESET}"
fi

# Check for next.config.mjs
if [ ! -f next.config.mjs ]; then
  echo -e "${RED}Error: next.config.mjs not found.${RESET}"
  echo "Make sure you're in the correct directory."
  exit 1
else
  echo -e "${GREEN}✓ next.config.mjs found${RESET}"
fi

# Check for vercel.json
if [ ! -f vercel.json ]; then
  echo -e "${YELLOW}Warning: vercel.json not found.${RESET}"
  echo "This may cause your deployment to miss important configurations."
else
  echo -e "${GREEN}✓ vercel.json found${RESET}"
fi

# Check node_modules
if [ ! -d node_modules ]; then
  echo -e "${YELLOW}Warning: node_modules not found.${RESET}"
  echo "Installing dependencies..."
  npm install
  echo -e "${GREEN}Dependencies installed.${RESET}"
else
  echo -e "${GREEN}✓ node_modules found${RESET}"
fi

# Run linting
echo -e "\n${BOLD}Running linting checks...${RESET}"
echo "-------------------------"
if npm run lint; then
  echo -e "${GREEN}✓ Linting passed${RESET}"
else
  echo -e "${RED}× Linting failed${RESET}"
  echo "Would you like to continue anyway? (y/n)"
  read continue_lint
  if [[ $continue_lint != "y" ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi

# Check for build errors
echo -e "\n${BOLD}Checking for build errors...${RESET}"
echo "----------------------------"
echo "Performing test build..."
if npm run build; then
  echo -e "${GREEN}✓ Build successful${RESET}"
else
  echo -e "${RED}× Build failed${RESET}"
  echo "Please fix build errors before deploying."
  exit 1
fi

# Deployment options
echo -e "\n${BOLD}Deployment Options${RESET}"
echo "-------------------"
echo "1. Deploy to production environment"
echo "2. Deploy to preview (staging) environment"
echo "3. Link project only (no deployment)"
echo "4. Cancel"
echo ""
echo "Please select an option (1-4):"
read deployment_option

case $deployment_option in
  1)
    echo -e "\n${BOLD}Deploying to production...${RESET}"
    vercel --prod
    ;;
  2)
    echo -e "\n${BOLD}Deploying to preview environment...${RESET}"
    vercel
    ;;
  3)
    echo -e "\n${BOLD}Linking project to Vercel...${RESET}"
    vercel link
    ;;
  4)
    echo "Deployment cancelled."
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid option. Exiting.${RESET}"
    exit 1
    ;;
esac

# Deployment complete
echo -e "\n${GREEN}${BOLD}Deployment process completed!${RESET}"
echo -e "${BOLD}Next steps:${RESET}"
echo "1. Run through the post-deployment checklist in post-deployment-checklist.md"
echo "2. Test all functionality in the deployed environment"
echo "3. Monitor error logs for the first 24 hours"
echo ""
echo "Thank you for using the Night Monkey deployment script!"