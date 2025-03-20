# Responses API

The Responses API is OpenAI's recommended successor to the Chat Completions API, offering superior conversation state management, tool integration, and simplicity.

## Key Advantages

### State Management

- Server-side conversation tracking
- Lower token overhead (no need to send entire history)
- Simple response chaining via `previous_response_id`

### Input/Output Flexibility

- Accept both string and message array inputs
- Structured output formatting
- Simpler extraction of responses

### Built-in Tool Support

- Native web search capabilities
- Code interpreter integration
- File analysis tools

## Implementation

### Basic Usage

```javascript
// Current Chat Completions approach
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me about OpenAI." }
  ]
});

// New Responses API approach
const response = await openai.responses.create({
  model: "gpt-4o",
  input: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me about OpenAI." }
  ],
  store: true  // Enable server-side state
});
```

### Continuing Conversations

```javascript
// First message
const initialResponse = await openai.responses.create({
  model: "gpt-4o",
  input: "What are the best programming languages?",
  store: true
});

// Follow-up using response ID
const followupResponse = await openai.responses.create({
  model: "gpt-4o",
  input: "Which one is best for web development?",
  previous_response_id: initialResponse.id
});
```

### Tool Usage

```javascript
const response = await openai.responses.create({
  model: "gpt-4o",
  input: "Find the latest news about AI advancements",
  tools: [{ type: "web_search" }],
  reasoning: {
    type: "chain_of_thought",
    effort: "high"
  }
});
```

## Migration Path

1. Identify all Chat Completions endpoints
2. Create wrapper functions for Responses API
3. Update state management to use response IDs
4. Add tool capabilities where appropriate
5. Test both simple and complex conversation flows

## Best Practices

- Use `store: true` for multi-turn conversations
- Leverage semantic events for insight into model thinking
- Start with simple string inputs for basic queries
- Implement tools gradually, beginning with web search
- Add caching layer for frequently accessed responses

## Performance Considerations

- Responses API reduces token overhead by up to 40%
- Server-side state management improves scalability
- Events provide better control over streaming responses
- Implement timeouts for tool operations
- Consider latency implications for real-time applications
