# Night Monkey - Pre-Deployment Testing Protocol

This document outlines the detailed testing procedure for verifying the Night Monkey application's functionality before deployment, focusing on the Responses API implementation and streaming features.

## Test Environment Setup

1. **Local Environment**
   - Ensure Node.js v18+ is installed
   - Install dependencies: `npm install`
   - Configure environment variables:
     ```
     OPENAI_API_KEY=your_api_key
     ```
   - Start development server: `npm run dev`

2. **Browser Setup**
   - Open Chrome DevTools (Network tab)
   - Set throttling to "Fast 3G" for testing interrupt functionality
   - Clear browser cache before testing

## Test Cases

### 1. Thread Creation

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T1.1 | Create new thread | 1. Visit homepage<br>2. Observe network requests | Chat component sends request to `/api/assistants/threads`<br>Response includes `threadId` | |
| T1.2 | Thread persistence | 1. Create thread<br>2. Refresh page<br>3. Send message | Thread should be recreated, messages persist on server | |
| T1.3 | Multiple threads | 1. Open app in multiple tabs<br>2. Send different messages | Each tab has separate thread with unique ID | |

### 2. Message Functionality

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T2.1 | Send basic message | 1. Type "Hello"<br>2. Click send | Message appears in UI<br>Assistant responds appropriately | |
| T2.2 | Send long message | 1. Type 500+ characters<br>2. Send message | Message is sent without truncation<br>Response correctly addresses full content | |
| T2.3 | Send message with code | 1. Send "Write a function to calculate Fibonacci"<br> | Response includes properly formatted code blocks | |
| T2.4 | Send message with markdown | 1. Send "Create a table of planet sizes" | Response includes properly rendered markdown table | |

### 3. Streaming Functionality

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T3.1 | Response streaming | 1. Send "Write a long paragraph about climate change" | Text appears incrementally as it's generated | |
| T3.2 | UI during streaming | 1. Send message<br>2. Observe UI during response | Input disabled during streaming<br>"Stop" button visible | |
| T3.3 | Multiple concurrent streams | 1. Open multiple browser tabs<br>2. Send messages simultaneously | All streams function independently | |

### 4. Stream Interruption

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T4.1 | Basic interruption | 1. Send "Write a 500 word essay"<br>2. Click "Stop" button during generation | Stream stops immediately<br>UI shows "Generation interrupted" | |
| T4.2 | Post-interruption state | 1. Interrupt a generation<br>2. Send new message | UI accepts new input<br>New message processes normally | |
| T4.3 | Rapid multiple interruptions | 1. Send complex query<br>2. Click stop<br>3. Send another<br>4. Click stop again | All interruptions work correctly<br>No lingering requests | |

### 5. Tool Calling

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T5.1 | Weather tool | 1. Send "What's the weather in New York?" | Tool call is made<br>Weather data is displayed | |
| T5.2 | Tool error handling | 1. Send "What's the weather in XYZ123?" (invalid location) | Error handled gracefully<br>Informative message displayed | |
| T5.3 | Multiple tool calls | 1. Send "Compare weather in Paris and London" | Multiple tool calls execute<br>Results incorporated in response | |

### 6. Error Handling

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T6.1 | Invalid API key | 1. Set invalid API key<br>2. Restart server<br>3. Send message | Error displayed to user<br>No uncaught exceptions | |
| T6.2 | Network interruption | 1. Send message<br>2. Disconnect internet mid-response | Error handled gracefully<br>UI allows retry | |
| T6.3 | Rate limiting | 1. Send multiple simultaneous requests | Appropriate error message<br>UI recovers gracefully | |

### 7. Response History

| Test ID | Description | Steps | Expected Result | Status |
|---------|-------------|-------|----------------|--------|
| T7.1 | Message persistence | 1. Send several messages<br>2. Refresh page | Thread recreates with history intact | |
| T7.2 | Long conversation | 1. Send 20+ messages in sequence | All messages displayed correctly<br>Proper scrolling behavior | |
| T7.3 | Context retention | 1. Ask about a topic<br>2. Follow up with "tell me more" | Assistant maintains context between messages | |

## Performance Testing

| Test ID | Description | Metrics to Capture | Expected Result | Status |
|---------|-------------|-------------------|----------------|--------|
| P1.1 | Initial load performance | Time to first contentful paint | < 1.5 seconds | |
| P1.2 | Message submission latency | Time from send to first token | < 1 second | |
| P1.3 | Streaming performance | Tokens per second | Smooth, consistent flow | |
| P1.4 | Memory usage | Browser memory consumption | No significant leaks over time | |

## Cross-Browser Testing

| Browser | Version | Basic Functionality | Streaming | Interruption | UI Rendering |
|---------|---------|---------------------|-----------|--------------|--------------|
| Chrome  | Latest  | | | | |
| Firefox | Latest  | | | | |
| Safari  | Latest  | | | | |
| Edge    | Latest  | | | | |

## Mobile Testing

| Device | Browser | Functionality | UI Adaptability | Input Handling |
|--------|---------|---------------|----------------|---------------|
| iPhone | Safari  | | | |
| Android| Chrome  | | | |
| iPad   | Safari  | | | |

## Test Results Summary

- Total tests: 24
- Passed: 
- Failed: 
- Blockers: 

## Issue Tracking

| Issue ID | Test Case | Description | Severity | Status |
|----------|----------|-------------|----------|--------|
| | | | | |

## Recommendations

- [ ] Proceed with deployment
- [ ] Fix critical issues before deployment
- [ ] Consider performance improvements