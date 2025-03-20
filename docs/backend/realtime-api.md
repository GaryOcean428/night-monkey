# Realtime API

OpenAI's Realtime API enables low-latency, multimodal interactions for voice and text applications with streaming capabilities.

## Key Features

- **Low-Latency Streaming:** Sub-200ms response times
- **Multimodal Capabilities:** Text and audio in a unified stream
- **Stateful Sessions:** Maintains conversation context
- **Event-Driven Architecture:** Controlled via WebSockets or WebRTC

## Implementation Options

### WebRTC (Client-Side)

Ideal for browser-based applications with direct media handling:

```javascript
// Client-side WebRTC connection
const startConversation = async () => {
  const connection = new RTCPeerConnection(configuration);
  
  // Add audio track
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getAudioTracks().forEach(track => {
    connection.addTrack(track, stream);
  });
  
  // Create offer
  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
  
  // Send offer to server and process response
  // ...
};
```

### WebSockets (Server-Side)

Preferred for server-to-server integrations and custom applications:

```javascript
// Server-side WebSocket connection
import WebSocket from 'ws';

const startConversation = async () => {
  const ws = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );
  
  // Setup event handlers
  ws.on('open', () => {
    // Start conversation
    ws.send(JSON.stringify({
      type: 'conversation.create',
      data: {
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy'
      }
    }));
  });
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // Handle different event types
    switch (data.type) {
      case 'conversation.created':
        // Conversation started
        break;
      case 'audio':
        // Process audio chunk
        break;
      case 'text':
        // Process text chunk
        break;
      // ... handle other events
    }
  });
};
```

## Event Types

The API uses an event-driven system with these common events:

- `conversation.create` - Initialize a new conversation
- `conversation.item.create` - Add a message to the conversation
- `audio` - Audio chunk from the model
- `text` - Text chunk from the model
- `content_block.delta` - Incremental update to text
- `function.call` - Function call request from the model

## Function Calling

The Realtime API supports function calling for triggering external operations:

```javascript
// Register available functions
ws.send(JSON.stringify({
  type: 'available_functions.create',
  data: {
    functions: [
      {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City and state, e.g., San Francisco, CA'
            }
          },
          required: ['location']
        }
      }
    ]
  }
}));

// Handle function calls
ws.on('message', (message) => {
  const data = JSON.parse(message);
  if (data.type === 'function.call') {
    const { name, arguments: args } = data.data;
    if (name === 'get_weather') {
      const weather = getWeatherForLocation(args.location);
      
      // Return function response
      ws.send(JSON.stringify({
        type: 'function.response',
        data: {
          id: data.data.id,
          response: {
            type: 'success',
            content: JSON.stringify(weather)
          }
        }
      }));
    }
  }
});
```

## Audio Configuration

The API supports multiple audio formats and configurations:

- **Sample Rate:** 24kHz (recommended)
- **Bit Depth:** 16-bit for highest quality
- **Codecs:** Raw PCM or G.711
- **Base64 Encoding:** For compact transmission

## Voice Options

Available voices include:

- `alloy` - Neutral, versatile voice
- `echo` - Soft-spoken, calming voice
- `fable` - Clear, articulate voice
- `onyx` - Deep, authoritative voice
- `nova` - Friendly, enthusiastic voice
- `shimmer` - Bright, cheerful voice

## Best Practices

1. **Connection Management:**
   - Implement reconnection logic with exponential backoff
   - Handle network transitions gracefully
   - Set appropriate timeouts for responses

2. **Media Handling:**
   - Process audio in chunks of 20-100ms
   - Use AudioContext for client-side processing
   - Implement voice activity detection

3. **User Experience:**
   - Provide visual indicators during processing
   - Allow users to interrupt responses
   - Implement fallback to text for audio failures

4. **Performance Optimization:**
   - Cache frequent responses
   - Use compression for audio streams
   - Implement connection pooling for high-volume apps

## Integration Partners

- **LiveKit:** WebRTC infrastructure and SDKs
- **Twilio:** Telephony integration
- **Agora:** Audio streaming platform

## Limitations

- 100 concurrent session limit (Tier 5 users)
- No vision modality support yet
- Rate limits on session creation
- Beta status with potential API changes