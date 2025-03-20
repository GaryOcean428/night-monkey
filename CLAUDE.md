# Night Monkey - Development Guidelines (2025)

## AI Model Configuration

### Supported Models

Only use the following models as specified in the project configuration:

#### OpenAI Models

- **o1**: Multi-step reasoning for intricate problems, computer use (200K context)
- **o1-pro**: Enhanced reasoning with specialized domain expertise (220K context)
- **o1-mini**: Efficient reasoning at lower cost (180K context)
- **gpt-4o**: Multimodal processing for text, images, and audio (128K context)
- **gpt-4o-mini**: Smaller, faster GPT-4o (128K context)
- **gpt-o3**: Advanced reasoning for STEM domains, research and coding (200K context)
- **gpt-o3-mini**: Efficient STEM reasoning at reduced cost (180K context)
- **gpt-4.5-preview**: Creative tasks, open-ended conversations (128K context)
- **gpt-4.5-turbo**: High-performance general capabilities (128K context)

#### Anthropic Models

- **claude-3-7-sonnet-20250219**: Advanced intelligence, text/image input, coding, agentic tools, computer use (desktop interaction)
- **claude-3-5-opus-20240620**: Advanced reasoning for complex tasks with longer outputs, research assistance
- **claude-3-5-haiku-20240307**: High-speed interactions, text processing, simple code completions

#### Google Models

- **gemini-2.0-flash-thinking-exp**: Complex reasoning, visible thought process, real-time streaming for dynamic tasks
- **gemini-2.0-pro-experimental**: Advanced coding tasks, long document analysis, video processing
- **gemini-2.0-flash-lite**: Cost-efficient high-volume operations with good performance balance

#### Groq/Meta Models

- **llama-3.3-70b-versatile**: General-purpose tasks requiring versatility

#### Perplexity Models

- **llama-3.1-sonar-huge-128k-online**: Real-time, search-augmented tasks needing up-to-date information

### Model Selection Criteria

- **Task Complexity:** Use `o1` or `claude-3-7-sonnet` for multi-step reasoning or computer use tasks.
- **Context Requirements:** Select `gemini-2.0-flash-thinking-exp` for large datasets or streaming needs.
- **Specialized Features:**
  - **Real-Time Streaming:** `gemini-2.0-flash-thinking-exp` for live data processing.
  - **Computer Use:** `claude-3-7-sonnet` (Anthropic) for desktop interactions; `o1` (OpenAI) for tool execution.
  - **Real-Time Responses:** `gpt-4.5-preview` for streaming API responses.
  - **Image Processing:** `claude-3-7-sonnet`.
  - **Web Search:** `llama-3.1-sonar-huge-128k-online`.

### Default Model

The default model for this project is **gpt-4o**. Before using a different model, check that it's supported in the `supportedModels` configuration in `frontend/openai.ts`.

## API Usage Guidelines

### OpenAI

Always use the Responses API rather than the older completions or chat completions APIs.

```typescript
// CORRECT: Use Responses API
const response = await openai.responses.create({
  model: "gpt-4o",
  input: messages,
  store: true,
});

// INCORRECT: Don't use older APIs
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: messages,
});
```

For streaming responses, use the streaming method from the Responses API:

```typescript
// Streaming response
const stream = await openai.responses.stream({
  model: "gpt-4o",
  input: messages,
  store: true,
});
```

### Integration Patterns

- Utilize the **router system** to dynamically select models based on task requirements.
- Implement **API failure fallbacks** with retries and alternate models.
- **Cache responses** for non-real-time queries; avoid caching for streaming tasks.
- **Monitor token usage** and optimize prompts for efficiency.
- **Streaming Integration:**
  - Use **Google Gemini API streaming** for real-time data handling (e.g., live updates, dynamic reasoning).
  - Leverage **OpenAI Responses API** for streaming completions in chat-like interactions.
- **Computer Use Integration:**
  - Implement **Anthropic Computer Use API** for desktop automation (e.g., file operations, UI interactions).
  - Use **OpenAI Computer Use** for executing tools or scripts on the host system.

### Environment Variables

Always check that the appropriate environment variables are set before using a model. This is implemented in both frontend and backend initialization:

```typescript
// In backend/main.ts
if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY environment variable not set");
}

// In frontend initialization
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable not set");
}
```

## Core Principles

### Reasoning-First Approach

- **Document your thought process** before coding to ensure decisions are well-considered.
- **Evaluate multiple approaches** and justify selections with clear reasoning.
- **Validate assumptions** explicitly in comments or documentation.
- **Break down complex tasks** into step-by-step analyses for clarity and accuracy.

### Project-Specific Architecture

- Adhere to the **multi-agent system architecture** as the backbone of the project.
- Follow established **neural core implementation patterns** for consistency.
- Enforce the **container/sandbox isolation model** to maintain security and modularity.
- Uphold the **circuit-inspired UI design system** for a unified visual and functional experience.

### Code Quality Standards

- Use **TypeScript with strict typing** to catch errors at compile time.
- Keep files **concise (<200 lines)** to enhance readability and maintainability.
- Choose **meaningful, descriptive variable names** that reflect their purpose.
- Adhere to naming conventions:
  - `camelCase` for variables and functions.
  - `PascalCase` for classes and interfaces.
  - `UPPERCASE_SNAKE_CASE` for constants.

### Error Handling & Performance

- Implement **robust error handling** to gracefully manage failures.
- Optimize performance with **React.memo**, **useMemo**, and **useCallback** where applicable.
- Ensure **resource cleanup** (e.g., event listeners, timers) to prevent memory leaks.
- Include **detailed logging** to facilitate debugging.
- Leverage **Zustand** for efficient state management, minimizing re-renders and ensuring persistence.

## Neural Core Development

### TensorFlow.js Integration

- Apply **memory optimization techniques** to ensure browser efficiency.
- Perform **tensor cleanup** with `tf.dispose()` or wrap operations in `tf.tidy()` for automatic management.
- Enable **progressive learning** to allow models to evolve with new data.
- **Modularize ML code** into reusable components for maintainability and updates.

### Agent Coordination

- Ensure **clear separation of agent roles** (e.g., reasoning, streaming, computer use).
- Use the **event system** for decoupled communication between agents.
- Implement **message passing protocols** for real-time coordination.
- Track **agent states** for debugging and performance monitoring.
- **Enhanced Coordination:**
  - Add **real-time streaming agents** to process live data from Google Gemini API.
  - Include **computer use agents** to handle desktop/tool interactions via Anthropic and OpenAI APIs.

## Container & Sandbox Guidelines

### Security Considerations

- Enforce **strict isolation** for user code and computer use operations.
- **Sanitize inputs/outputs** using tools like `DOMPurify` for web data or custom validators for system commands.
- Set **resource limits** (CPU, memory, disk I/O) for sandboxed environments.
- Add **timeouts** to cap long-running or streaming operations.

**Enhanced Measures:**

- Use **WebAssembly** or **worker_threads** for secure execution of computer use tasks.
- Implement **permission scopes** for computer use APIs (e.g., restrict file access, UI control).
- Regularly **audit sandbox logs** for unauthorized system interactions.

### Advanced Tooling (Beyond Headless Browsers)

- **Google Realtime Streaming:**
  - Integrate **Gemini API streaming** for tasks like live transcription, real-time analysis, or dynamic UI updates.
  - Handle streaming errors with graceful degradation (e.g., switch to batch processing).
- **OpenAI Computer Use & Responses API:**
  - Use **Computer Use API** to execute system-level commands or interact with local tools (e.g., run scripts, open apps).
  - Implement **Responses API** for streaming chat completions with low latency.
- **Anthropic Computer Use:**
  - Enable **desktop automation** (e.g., clicking UI elements, reading screen content) via Anthropic's API.
  - Validate and sandbox all desktop interactions to prevent misuse.

## UI Development Guidelines

### Component Structure

- Follow the **circuit-inspired design system** for visual consistency.
- Use a **panel-based layout** to organize UI components logically.
- Ensure **responsiveness** across all device sizes.
- Meet **WCAG 2.1 accessibility standards** with semantic HTML and ARIA roles.

**Accessibility Enhancements:**

- Test with **axe-core** or **Lighthouse** to ensure compliance.
- Support **keyboard navigation** and **screen readers**.

### State Management

- Use **Zustand** for global state to optimize performance and persistence.
- Properly **initialize and clean up state** to avoid leaks.
- Avoid **prop drilling** by leveraging context or Zustand.
- Use **local state** for component-specific logic.

### Performance Optimization

- Apply **code splitting** to reduce initial load times.
- Implement **lazy loading** for resource-heavy components.
- Use **memoization** (`useMemo`, `useCallback`) to minimize re-renders.
- Optimize state updates for efficient rendering.

## Framework Requirements

### Next.js

- **Minimum Version:** 15.0 or higher
- **Best Practices:**
  - Use App Router for all new routes
  - Implement Partial Prerendering for dynamic content
  - Apply Server Components for UI rendering where possible
  - Implement proper caching strategies
  - Use static generation with generateStaticParams for dynamic routes
  - Leverage image optimization with next/image

### React

- **Minimum Version:** 19.0 or higher
- **Best Practices:**
  - Leverage the React Compiler for automatic optimizations
  - Use new hooks (useActionState, useFormStatus) for form handling
  - Implement Server Actions for data mutations
  - Apply asset preloading for improved performance
  - Simplify ref handling with direct prop access
  - Utilize automatic batching for state updates

## Documentation Requirements

- Document **all public APIs and components** with clear instructions.
- Use **JSDoc comments** for functions and classes to auto-generate documentation.
- Provide **practical examples** for complex features (e.g., streaming or computer use integrations).
- **Keep documentation current** by updating it alongside code changes.

## Development Commands

### Package Management

```bash
# Install dependencies (preferred)
yarn

# Alternative
npm install

# Development server - runs both frontend and backend (preferred)
yarn dev

# Run frontend only
yarn frontend:dev

# Watch TypeScript compilation for backend
yarn backend:dev

# Production build (preferred)
yarn build

# Start production server (preferred)
yarn start
```

**Yarn Usage Guidelines:**

- Always prefer Yarn over npm commands for consistency
- Use `yarn add package-name` instead of `npm install package-name`
- Use `yarn add -D package-name` for dev dependencies
- Run scripts with `yarn script-name` instead of `npm run script-name`
- Maintain a single `yarn.lock` file
- Use Yarn workspaces for monorepo management when applicable

### Linting and Type Checking

```bash
# Run ESLint
yarn lint

# Type checking for the entire project
yarn typecheck

# Type checking for frontend only
cd frontend && yarn typecheck

# Type checking for backend only
cd backend && yarn typecheck
```

### Testing

```bash
# Run all tests
yarn test

# Run specific test
yarn test -- -t "test name"
```

### Make Commands

- **Backend**

  - Install: `make install-backend` or `cd backend && ./install.sh`
  - Run: `make run-backend` or `cd backend && uvicorn main:app --reload`
  - Test: `cd backend && pytest` or `pytest backend/tests/specific_test.py::test_name`
  - Check: `ps aux | grep uvicorn`
  - Stop: `pkill -f uvicorn`

- **Frontend**
  - Install: `make install-frontend` or `cd frontend && ./install.sh`
  - Run: `make run-frontend` or `cd frontend && yarn dev`
  - Build: `cd frontend && yarn build`
  - Lint: `cd frontend && yarn lint`
  - Check: `ps aux | grep 'yarn dev\|node.*vite'`
  - Stop: `pkill -f 'yarn dev\|node.*vite'`

### Starting Development Servers

- **Check for running servers** with `ps aux | grep -E 'vite|webpack|node.*dev'`.
- **Stop existing servers** using `pkill -f "node.*vite" || true`.
- Kill servers on specific ports with `fuser -k <PORT>/tcp` (e.g., `fuser -k 5173/tcp`).
- Verify termination with `lsof -i :<PORT>`.

### Port Management

- Avoid **common ports** (3000, 5173, 8080).
- Assign **unique ranges**:
  - Frontend: 5675-5699
  - Backend: 8765-8799
  - Firebase emulators: 9080-9099
- **Document ports** in project files.

## Deployment (Vercel)

See full deployment instructions in `DEPLOYMENT.md`

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY
```

## Git Workflow

### Branching Strategy

- Create **feature branches** for new development.
- Use **bugfix branches** for fixes.
- Manage releases with **release branches**.
- Address urgent issues with **hotfix branches**.

### Commit Guidelines

- Write **descriptive commit messages** (e.g., "Add real-time streaming with Gemini API").
- Link to **issue numbers** for traceability.
- Keep commits **atomic** (single-purpose).
- **Squash commits** before merging for a clean history.

### Pull Request Process

- Include **detailed descriptions** of changes and their impact.
- Attach **test results** or screenshots as evidence.
- Request reviews from **relevant team members**.
- Resolve **all feedback** before merging.

## Testing Requirements

### Unit Testing

- Test **utility functions** and **components** in isolation.
- Mock **external dependencies** to focus on unit logic.
- Target **>80% coverage** for critical code paths.
- Use **Vitest** and **React Testing Library** for consistency.

### Integration Testing

- Verify **component interactions** and **API integrations**.
- Test **user workflows** to ensure seamless functionality.
- Validate **error handling** across integrated systems.

### End-to-End Testing

- Test **key user journeys** with tools like **Cypress** or **Playwright**.
- Simulate **production-like environments** for accuracy.
- Ensure **cross-browser compatibility** and performance benchmarks.

## Project Documentation

- [STRUCTURE.md](./docs/reorganization/STRUCTURE.md) - Detailed frontend/backend organization
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment instructions and checklists
- [REORGANIZATION.md](./docs/reorganization/REORGANIZATION.md) - Frontend/backend reorganization details
- [CLEANUP-PLAN.md](./docs/reorganization/CLEANUP-PLAN.md) - Post-reorganization cleanup steps

## External References

- [OpenAI Responses API](https://platform.openai.com/docs/guides/responses-api)
- [Responses API Code Examples](https://platform.openai.com/docs/guides/responses-api/code-examples)
- [OpenAI Model Details](https://platform.openai.com/docs/models)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Anthropic Computer Use Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/computer-use)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [OpenAI Tools and Responses API](https://platform.openai.com/docs/guides/tools?api-mode=chat)
