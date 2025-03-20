# Vercel CLI Deployment Commands (2025 Edition)

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

# Deploy with increased memory allocation (for compute-intensive functions)
vercel --prod --max-memory=3008
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

# Get detailed logs for a deployment
vercel logs deployment-url
```

## Security and Protection

```bash
# Enable password protection for a deployment
vercel --prod --protection password

# Deploy with IP access restrictions
vercel --prod --protection ip

# Configure Web Application Firewall (WAF) rules
vercel project waf-rules add block-path --value "/admin/.*"

# Enable deployment protection for branches
vercel project protection enable
```

## Performance Optimization

```bash
# Enable edge caching for a route 
vercel functions:cache add "/api/data" --duration=3600

# Configure Image Optimization settings
vercel project image-settings --sizes=320,640,1280 --quality=80

# Enable bytecode optimization for faster cold starts
vercel functions:opt enable --functions="/api/intensive-task"

# Set memory size for specific functions
vercel functions:memory set "/api/heavy-task" --size=2048
```

## Team Management

```bash
# List teams
vercel teams ls

# Switch to a team
vercel switch team-slug

# Deploy to a specific team
vercel --scope team-slug --prod

# Invite a new team member
vercel teams invite user@example.com
```

## Aliases and Domains

```bash
# Create an alias for your deployment
vercel alias deployment-url custom-subdomain.vercel.app

# Link a custom domain to your project
vercel domains add custom-domain.com

# Configure SSL settings for a domain
vercel certs issue custom-domain.com
```

## Environment Variables Management

```bash
# Add an environment variable to the project
vercel env add OPENAI_API_KEY production

# List all environment variables
vercel env ls

# Remove an environment variable
vercel env rm OPENAI_API_KEY production

# Add encrypted environment variables
vercel env add SECRET_KEY production --encrypted
```

## Project Settings

```bash
# Link to the default project
vercel link

# View project settings
vercel project ls

# Pull environment variables from Vercel to local
vercel env pull

# Configure build settings
vercel project settings set buildCommand "npm run build:optimized"
```

## Monitoring and Analytics

```bash
# Get WebVitals performance metrics
vercel insights performance

# View error reports
vercel insights errors

# Check serverless function performance
vercel functions:metrics

# Get analytics for a specific time period
vercel analytics --from="2025-01-01" --to="2025-01-31"
```

## CI/CD Integration

```bash
# Deploy from GitHub Actions (add to workflow file)
- name: Deploy to Vercel
  run: vercel --token ${VERCEL_TOKEN} --prod

# Create a deploy hook (for external CI systems)
vercel deploy-hooks add --name "CI Deploy" --path "/"
```

## Collaboration Features

```bash
# Create a comment on a preview deployment
vercel comments add "This feature looks great!" --deployment preview-url

# Resolve a comment
vercel comments resolve comment-id

# List all comments on a deployment
vercel comments list --deployment preview-url
```