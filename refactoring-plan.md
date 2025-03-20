# Night Monkey - Refactoring Plan

## Goal
Restructure the codebase into separate frontend and backend directories to create a more modular and maintainable architecture.

## Current Structure
- `/app` contains both frontend and backend code mixed together
- API routes in `/app/api/...`
- Components in `/app/components/...`
- Utility functions in `/app/utils/...`
- Configuration files in the root of `/app`

## New Structure

### Backend
```
/backend
  /api
    /assistants/
      /files/
        route.ts
      route.ts
      /threads/
        /[threadId]/
          /actions/
            route.ts
          /messages/
            route.ts
        route.ts
    /files/
      /[fileId]/
        route.ts
    /responses/
      /interrupt/
        route.ts
      /tools/
        route.ts
      route.ts
  /config
    openai.ts
    providers.ts
    model-router.ts
    tools-config.ts
  /utils
    thread-manager.ts
    stream-handler.ts
    weather.ts
```

### Frontend
```
/frontend
  /components
    chat.tsx
    chat.module.css
    file-viewer.tsx
    file-viewer.module.css
    responsive-chat.tsx
    warnings.tsx
    warnings.module.css
    weather-widget.tsx
    weather-widget.module.css
  /pages
    /examples
      /all
        page.tsx
        page.module.css
      /basic-chat
        page.tsx
        page.module.css
      /file-search
        page.tsx
      /function-calling
        page.tsx
      /responses-api
        page.tsx
      /shared
        page.module.css
  /styles
    globals.css
  /config
    assistant-config.ts
  layout.tsx
  page.tsx
  page.module.css
```

### Root Configuration
```
/next.config.mjs (updated with new path mappings)
/tsconfig.json (updated with new path mappings)
```

## Implementation Steps

### 1. Create Directory Structure
- Create `/backend` and `/frontend` directories
- Create all subdirectories according to the new structure

### 2. Move Backend Files
- Move API routes to `/backend/api`
- Move utility functions to `/backend/utils`
- Move configuration files to `/backend/config`

### 3. Move Frontend Files
- Move components to `/frontend/components`
- Move pages and examples to `/frontend/pages`
- Move styles to `/frontend/styles`
- Move layout and page files to `/frontend`

### 4. Update Import Paths
- Update all import paths in moved files
- Use path aliases for cleaner imports

### 5. Update Configuration Files
- Update `next.config.mjs` to include new path mappings
- Update `tsconfig.json` with new path aliases

### 6. Configure Path Mapping
Update `tsconfig.json` with the following path mappings:
```json
"paths": {
  "@/*": ["./*"],
  "@backend/*": ["./backend/*"],
  "@frontend/*": ["./frontend/*"]
}
```

### 7. Verify File Structure
- Ensure all files are in their correct locations
- Check for any missing files or directories

### 8. Test API Routes
- Ensure all API routes are accessible
- Verify parameters are correctly passed

### 9. Test UI Components
- Ensure all components render correctly
- Verify component interactions work as expected

### 10. Check for Errors
- Run TypeScript compiler
- Run linter
- Fix any issues found

## Dependencies and Import Patterns

### Backend to Frontend Dependencies
- The backend should not directly import from frontend

### Frontend to Backend Dependencies
- Frontend components will need to access API endpoints
- Use fetch API for communication

### Shared Code
- Create shared utilities in `/shared` if needed
- Common types should be in `/shared/types`

## Migration Strategy
1. Start with utility functions and configuration
2. Then migrate API routes
3. Finally migrate UI components
4. Test each step incrementally

## Testing the Migration
- Create simple test scripts to verify API functionality
- Use the browser to test UI components
- Create a checklist of features to verify