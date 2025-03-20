# Night Monkey Project Structure

This project has been reorganized into a clear frontend and backend structure for better maintainability and separation of concerns.

## Directory Structure

```
/
├── frontend/               # Frontend application code
│   ├── app/                # Next.js app directory
│   │   ├── examples/       # Example pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable UI components
│   ├── utils/              # Frontend utility functions
│   ├── openai.ts           # OpenAI client configuration
│   ├── tools-config.ts     # Tools configuration
│   └── assistant-config.ts # Assistant configuration
│
├── backend/                # Backend server code
│   ├── api/                # API routes organized by domain
│   │   ├── assistants/     # Assistants API endpoints
│   │   ├── files/          # File handling endpoints
│   │   └── responses/      # Responses API endpoints
│   ├── utils/              # Backend utility functions
│   ├── openai.ts           # OpenAI client for backend
│   ├── tools-config.ts     # Tool definitions for backend
│   └── model-router.ts     # Model routing logic
│
├── public/                 # Static assets
├── docs/                   # Documentation
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── next.config.mjs         # Next.js configuration
```

## Running the Application

### Development

```bash
# Start the Next.js development server (frontend + backend API routes)
yarn dev

# Start only the frontend development server
yarn frontend:dev

# Watch TypeScript compilation for backend files
yarn backend:dev
```

### Production

```bash
# Build the application
yarn build

# Start the production server
yarn start
```

## Code Organization

1. **Frontend**: Contains all user interface components, pages, and frontend utilities. Uses Next.js App Router.

2. **Backend**: Contains all API routes and backend-specific code, including server-side utilities and configurations.

Both frontend and backend share similar configuration files (like openai.ts) but they are kept separate to allow for future complete separation if needed.

## Import Paths

- Frontend code should import from `@/frontend/...`
- Backend code should import from `@/backend/...`

Example:
```typescript
// In a frontend component
import { myUtil } from "@/frontend/utils/myUtil";

// In a backend API route
import { myUtil } from "@/backend/utils/myUtil";
```

## Testing

To run TypeScript type checking:
```bash
yarn typecheck
```

To run linting:
```bash
yarn lint
```