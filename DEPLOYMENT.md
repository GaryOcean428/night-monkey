# Night Monkey - Vercel Deployment Guide (2025)

## Prerequisites

Before deploying Night Monkey to Vercel, ensure you have:

1. A Vercel account (https://vercel.com/signup)
2. An OpenAI API key (https://platform.openai.com/api-keys)
3. Git repository with your Night Monkey codebase

## Deployment Steps

### 1. Using the Vercel CLI (Recommended)

If you prefer to use the Vercel CLI for deployment:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd /path/to/night-monkey
vercel --prod
```

During the deployment process, you'll be prompted to:
- Set up environment variables (add your OPENAI_API_KEY)
- Confirm deployment settings

### 2. Using the Vercel Dashboard

To deploy using the Vercel web interface:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
   - Leave other settings at their defaults
5. Click "Deploy"

### 3. One-Click Deployment Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2Fnight-monkey&env=OPENAI_API_KEY&envDescription=API%20Keys%20Required%20for%20Authentication)

## Environment Variables

The following environment variables should be set in your Vercel project:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude models) | No |
| `GOOGLE_API_KEY` | Google API key (for Gemini models) | No |
| `GROQ_API_KEY` | Groq API key (for Llama models) | No |
| `PERPLEXITY_API_KEY` | Perplexity API key | No |

## Security Enhancements

Night Monkey is configured with Vercel's latest security features:

1. **Content Security Policy (CSP)**: Pre-configured headers to prevent XSS attacks
2. **Web Application Firewall (WAF)**: Protection against OWASP Top 10 vulnerabilities
3. **Deployment Protection**: Options include:
   - Password protection for staging environments
   - IP allowlisting for sensitive deployments
   - Team access controls

## Performance Optimizations

Your deployment has been optimized with:

- **Edge Network Caching**: Static assets cached at edge locations worldwide
- **Bytecode-Optimized Functions**: 30% faster cold starts for API routes
- **Image Optimization Pipeline**: Automatic WebP/AVIF format conversion and resizing
- **Incremental Static Regeneration (ISR)**: For pages with dynamic content
- Exclusion of docs folder from build
- Standalone output mode for smaller deployment size
- Security headers and clean URLs

## Advanced Configuration

### Custom Caching Strategies

```js
// Example header configuration in next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ]
  },
}
```

### Memory and CPU Allocation

For improved performance on computation-heavy routes:

```bash
vercel deploy --max-memory=3008
```

## Monitoring and Analytics

Once deployed, you can monitor your application using:

1. **Vercel Analytics**: Real-time performance metrics for Core Web Vitals
2. **Function Execution Metrics**: Track serverless function performance
3. **Error Tracking**: Identify and debug runtime errors

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Ensure API keys have the correct permissions
4. Check the browser console for client-side errors
5. Review function logs in the Vercel dashboard

## Updates and Maintenance

To update your deployment:
- Push changes to your connected Git repository
- Vercel will automatically rebuild and deploy
- Preview deployments are generated for pull requests

## Collaboration Features

For team development:

1. **Preview Environments**: Auto-generated for each PR
2. **Environment Variable Management**: Separate configs for production/preview
3. **Comment Annotations**: Team feedback directly on preview deployments