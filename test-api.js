// Simple test script for validating Responses API implementation
// Usage: node test-api.js

const { createResponse, createStreamingResponse } = require('./app/openai');
const streamHandler = require('./app/utils/stream-handler');
const threadManager = require('./app/utils/thread-manager');

async function runTests() {
  console.log('🧪 Starting Night Monkey API Tests 🧪');
  console.log('=====================================');
  
  try {
    // Test 1: Thread Creation
    console.log('\n🔍 TEST 1: Thread Creation');
    console.log('-------------------------');
    const thread = await threadManager.createThread();
    console.log(`✓ Thread created successfully with ID: ${thread.id}`);
    console.log(`✓ Thread model: ${thread.model}`);
    console.log(`✓ Created timestamp: ${new Date(thread.created * 1000).toISOString()}`);
    
    // Test 2: Send Message to Thread
    console.log('\n🔍 TEST 2: Send Message to Thread');
    console.log('-------------------------------');
    const message = "Hello, what can you tell me about the Responses API?";
    console.log(`Sending message: "${message}"`);
    
    const response = await threadManager.sendMessageToThread(
      thread.id,
      message,
      { stream: false } // Use non-streaming for easier testing
    );
    
    console.log(`✓ Response ID: ${response.id}`);
    console.log(`✓ Model: ${response.model}`);
    console.log(`✓ First 100 chars of response: ${response.message.content.substring(0, 100)}...`);
    
    // Test 3: Get Thread Messages
    console.log('\n🔍 TEST 3: Retrieve Thread Messages');
    console.log('----------------------------------');
    const messages = await threadManager.getThreadMessages(thread.id);
    console.log(`✓ Retrieved ${messages.length} messages`);
    messages.forEach((msg, i) => {
      console.log(`  Message ${i+1}: ${msg.role.toUpperCase()} (${new Date(msg.created * 1000).toISOString()})`);
      console.log(`  Content: ${msg.content.substring(0, 50)}...`);
    });
    
    // Test 4: Tool Calling
    console.log('\n🔍 TEST 4: Tool Calling');
    console.log('---------------------');
    const toolMessage = "What's the weather in New York?";
    console.log(`Sending message with potential tool call: "${toolMessage}"`);
    
    const toolResponse = await threadManager.sendMessageToThread(
      thread.id,
      toolMessage,
      { 
        stream: false,
        tools: [{ type: "function", function: { name: "get_weather" } }]
      }
    );
    
    const hasToolCalls = toolResponse.message.tool_calls && toolResponse.message.tool_calls.length > 0;
    console.log(`✓ Response received with tool calls: ${hasToolCalls}`);
    if (hasToolCalls) {
      console.log(`✓ Number of tool calls: ${toolResponse.message.tool_calls.length}`);
      toolResponse.message.tool_calls.forEach((call, i) => {
        console.log(`  Tool Call ${i+1}: ${call.function.name}`);
        console.log(`  Arguments: ${call.function.arguments}`);
      });
    }
    
    // Test 5: Stream Interrupt Registration
    console.log('\n🔍 TEST 5: Stream Handling');
    console.log('------------------------');
    console.log('Starting a streaming response that we can track...');
    
    const streamingResponse = await createStreamingResponse(
      "Write a long story about a space adventure",
      { store: true }
    );
    
    streamHandler.registerStream(streamingResponse.id, streamingResponse);
    console.log(`✓ Stream registered with ID: ${streamingResponse.id}`);
    console.log(`✓ Active streams count: ${streamHandler.getActiveStreamCount()}`);
    
    // Interrupt the stream after 2 seconds
    console.log('Waiting 2 seconds before interrupting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const interrupted = streamHandler.interruptStream(streamingResponse.id);
    console.log(`✓ Stream interrupted: ${interrupted}`);
    console.log(`✓ Active streams count after interrupt: ${streamHandler.getActiveStreamCount()}`);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

runTests();