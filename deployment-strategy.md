# Night Monkey - Branch-Based Deployment Strategy

## Overview

This document outlines the branch-based deployment strategy for Night Monkey, ensuring smooth rollout of features while maintaining stability in production.

## Branch Structure

| Branch | Purpose | Environment | Auto Deploy |
|--------|---------|-------------|------------|
| `main` | Production code | Production | Yes |
| `staging` | Pre-production testing | Staging | Yes |
| `dev` | Active development | Development | Yes |
| `feature/*` | Feature branches | Preview | On PR |
| `hotfix/*` | Emergency fixes | Preview | On PR |

## Environments

### Development
- URL: `dev.night-monkey.vercel.app`
- Purpose: Testing new features during development
- Deployed from: `dev` branch
- Environment variables: Development API keys
- Feature flags: All enabled for testing

### Staging
- URL: `staging.night-monkey.vercel.app`
- Purpose: Pre-production verification
- Deployed from: `staging` branch
- Environment variables: Production API keys with usage limits
- Feature flags: Match production + features pending release

### Production
- URL: `night-monkey.vercel.app`
- Purpose: Live user-facing application
- Deployed from: `main` branch
- Environment variables: Production API keys
- Feature flags: Only stable features

## Deployment Workflow

### Feature Development
1. Create feature branch: `feature/name-of-feature`
2. Develop and test locally
3. Create PR to `dev` branch
4. Vercel creates preview deployment
5. Review and approve PR
6. Merge to `dev` -> Auto-deploy to development environment
7. Test in development environment

### Release to Staging
1. Create PR from `dev` to `staging`
2. Review all changes included in the release
3. Run pre-deployment tests on preview
4. Approve and merge PR
5. Auto-deploy to staging environment
6. Complete post-deployment verification checklist
7. Monitor for 24-48 hours

### Production Release
1. Create PR from `staging` to `main`
2. Final review of all changes
3. Approve and merge PR
4. Auto-deploy to production
5. Complete production verification checklist
6. Monitor performance metrics and error rates

### Hotfix Process
1. Create hotfix branch from `main`: `hotfix/issue-description`
2. Implement and test fix
3. Create PR to `main`
4. After approval, merge to `main`
5. Cherry-pick changes back to `staging` and `dev` branches

## Rollback Procedure

If issues are detected in production:

1. Immediate rollback:
   ```bash
   vercel rollback --prod
   ```

2. For more complex rollbacks:
   - Create revert PR to `main` branch
   - Fast-track approval process
   - Deploy immediately

## Vercel-Specific Configuration

### Branch Protection
- `main`: Require pull request reviews and status checks
- `staging`: Require pull request reviews
- `dev`: Allow team members to push directly

### Environment Protection
- Production: Password protected preview and IP allowlist
- Staging: Team-only access for previews
- Development: Open access for team members

### Environment Variables
Each environment has its own set of environment variables:
- Production: Full access to production services
- Staging: Production APIs with usage monitoring/limits
- Development: Development keys with high rate limits

## Monitoring and Alerting

- Production deployments trigger enhanced monitoring for 1 hour
- Error rate threshold alerts sent to Slack channel
- Performance degradation triggers alert
- Weekly deployment report generated automatically

## Post-Deployment Verification

After each deployment, the corresponding verification checklist must be completed:
- Development: Basic functionality check
- Staging: Complete test suite and performance benchmarking
- Production: Critical path verification

## Documentation

All deployments should be documented with:
1. PR description detailing changes
2. Completed verification checklist
3. Any issues encountered and resolutions
4. Performance metrics before/after

## Multi-Provider Deployment Timeline

1. **Phase 1: OpenAI Responses API** (Current)
   - Deploy modernized OpenAI implementation
   - Establish monitoring baselines
   - Fix any issues discovered in production

2. **Phase 2: Claude Integration** (2-4 weeks after Phase 1)
   - Implement Claude API integration in `feature/claude-integration`
   - Follow standard deployment workflow
   - Activate with feature flag in production

3. **Phase 3: Gemini Integration** (4-6 weeks after Phase 2)
   - Implement Gemini API in `feature/gemini-integration`
   - Follow standard deployment workflow
   - Activate with feature flag in production

4. **Phase 4: Model Comparison** (2 weeks after Phase 3)
   - Add model selection UI
   - Implement performance metrics comparison
   - Deploy with all providers enabled

## Conclusion

This branch-based deployment strategy provides a structured approach to safely delivering new features while maintaining stability in the production environment. By following this workflow, we can ensure smooth, predictable deployments with minimal risk of disruption to users.