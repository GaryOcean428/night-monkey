# Night Monkey (2025)

A modern Next.js application utilizing the latest OpenAI [Responses API](https://platform.openai.com/docs/guides/responses-api) and [Assistants API](https://platform.openai.com/docs/assistants/overview).
<br/>
<br/>
![Night Monkey](https://github.com/openai/openai-assistants-quickstart/assets/27232/755e85e9-3ea4-421f-b202-3b0c435ea270)

## Features

- Multi-model support (OpenAI, Claude, Gemini, Llama)
- Streaming responses with interruption capability
- Function calling with weather demo widget
- File search and document analysis
- Full responsive design

## Supported Models

| Provider | Models |
|----------|--------|
| OpenAI | o1, o1-pro, o1-mini, gpt-4o, gpt-4o-mini, gpt-o3, gpt-o3-mini, gpt-4.5-preview, gpt-4.5-turbo |
| Anthropic | claude-3-7-sonnet-20250219, claude-3-5-opus-20240620, claude-3-5-haiku-20240307 |
| Google | gemini-2.0-flash-thinking-exp, gemini-2.0-pro-experimental, gemini-2.0-flash-lite |
| Meta/Groq | llama-3.3-70b-versatile |
| Perplexity | llama-3.1-sonar-huge-128k-online |

## Setup

### 1. Clone repo

```shell
git clone https://github.com/YourUsername/night-monkey.git
cd night-monkey
```

### 2. Set your API keys

```shell
# Create .env file from template
cp .env.example .env

# Edit .env file with your API keys
# Required
export OPENAI_API_KEY="sk_..."

# Optional (for multi-model support)
export ANTHROPIC_API_KEY="sk_ant_..."
export GOOGLE_API_KEY="AIza..."
export GROQ_API_KEY="gsk_..."
export PERPLEXITY_API_KEY="pplx-..."
```

### 3. Install dependencies

```shell
npm install
```

### 4. Run development server

```shell
npm run dev
```

### 5. Navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2Fnight-monkey&env=OPENAI_API_KEY&envDescription=API%20Keys%20Required%20for%20Authentication)

## Overview

This project uses the latest OpenAI Responses API and Assistants API in Next.js with [streaming](https://platform.openai.com/docs/assistants/overview/step-4-create-a-run), tool use ([code interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter) and [file search](https://platform.openai.com/docs/assistants/tools/file-search)), and [function calling](https://platform.openai.com/docs/assistants/tools/function-calling). While there are multiple pages to demonstrate each of these capabilities, they all use the same underlying assistant with all capabilities enabled.

The main logic for chat will be found in the `Chat` component in `app/components/chat.tsx`, and the handlers starting with `api/assistants/threads` (found in `api/assistants/threads/...`) and `api/responses` for the Responses API implementation.

### Pages

- Basic Chat Example: [http://localhost:3000/examples/basic-chat](http://localhost:3000/examples/basic-chat)
- Function Calling Example: [http://localhost:3000/examples/function-calling](http://localhost:3000/examples/function-calling)
- File Search Example: [http://localhost:3000/examples/file-search](http://localhost:3000/examples/file-search)
- Full-featured Example: [http://localhost:3000/examples/all](http://localhost:3000/examples/all)

### Main Components

- `app/components/chat.tsx` - handles chat rendering, [streaming](https://platform.openai.com/docs/assistants/overview?context=with-streaming), and [function call](https://platform.openai.com/docs/assistants/tools/function-calling/quickstart?context=streaming&lang=node.js) forwarding
- `app/components/file-viewer.tsx` - handles uploading, fetching, and deleting files for [file search](https://platform.openai.com/docs/assistants/tools/file-search)

### Endpoints

- `api/assistants` - `POST`: create assistant (only used at startup)
- `api/assistants/threads` - `POST`: create new thread
- `api/assistants/threads/[threadId]/messages` - `POST`: send message to assistant
- `api/assistants/threads/[threadId]/actions` - `POST`: inform assistant of the result of a function it decided to call
- `api/assistants/files` - `GET`/`POST`/`DELETE`: fetch, upload, and delete assistant files for file search
