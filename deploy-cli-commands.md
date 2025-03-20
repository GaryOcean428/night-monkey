# Vercel CLI Deployment Commands

## Basic Deployment

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project (interactive mode)
vercel

# Deploy to production
vercel --prod
```

## Advanced Deployment Options

```bash
# Deploy with environment variables directly
vercel --env OPENAI_API_KEY=your_api_key_here --prod

# Deploy with a specific environment variable file
vercel --env-file .env.production --prod

# Deploy preview (not production)
vercel --force

# Deploy with a specific project name
vercel --name night-monkey-yourname --prod

# Deploy from a branch other than main
vercel --prod --branch feature-branch
```

## Deployment Management

```bash
# List all deployments
vercel ls

# Get deployment details
vercel inspect deployment-url

# Remove a deployment
vercel remove deployment-url

# Set up a custom domain
vercel domains add yoursite.com

# List production deployments only
vercel ls --production
```

## Team Management

```bash
# List teams
vercel teams ls

# Switch to a team
vercel switch team-slug

# Deploy to a specific team
vercel --scope team-slug --prod
```

## Aliases and Domains

```bash
# Create an alias for your deployment
vercel alias deployment-url custom-subdomain.vercel.app

# Link a custom domain to your project
vercel domains add custom-domain.com
```

## Environment Variables Management

```bash
# Add an environment variable to the project
vercel env add OPENAI_API_KEY production

# List all environment variables
vercel env ls

# Remove an environment variable
vercel env rm OPENAI_API_KEY production
```

## Project Settings

```bash
# Link to the default project
vercel link

# View project settings
vercel project ls

# Pull environment variables from Vercel to local
vercel env pull
```