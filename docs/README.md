# Night Monkey Documentation

This documentation covers modern AI APIs and best practices for implementing them in Next.js applications.

## Table of Contents

- [Frontend Documentation](./frontend/README.md)
  - [Next.js Best Practices](./frontend/nextjs-best-practices.md)
  - [React v19 Features](./frontend/react-v19-features.md)

- [Backend Documentation](./backend/README.md)
  - [Responses API](./backend/responses-api.md)
  - [Agents SDK](./backend/agents-sdk.md)
  - [Realtime API](./backend/realtime-api.md)
  - [Model Capabilities](./backend/model-capabilities.md)
  - [Advanced Model Routing](./backend/advanced-model-routing.md)
  - [Model Calibration](./backend/model-calibration.md)

- [Modernization Plan](./modernization-plan.md)
- [Tasks](./tasks.md)

## Overview

This application is being modernized to leverage the latest capabilities from OpenAI and other AI providers. Key upgrades include:

1. **API Modernization**
   - Migrating from Chat Completions API to Responses API
   - Implementing Agents SDK for complex workflows
   - Adding Realtime API for voice interactions

2. **Framework Updates**
   - Upgrading to Next.js 15 and React 19
   - Implementing modern patterns like Server Components and Partial Prerendering

3. **Advanced Model Routing**
   - Implementing intelligent model selection based on query analysis
   - Creating a calibration system for model capabilities
   - Supporting multiple providers (OpenAI, Anthropic, Google)

4. **Enhanced Features**
   - Voice-based interactions
   - Tool integration (web search, code execution)
   - Multi-model support
   - Real-time streaming responses
