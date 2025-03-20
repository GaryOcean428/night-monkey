/**
 * Thread Manager for OpenAI Responses API
 * 
 * This utility handles the management of conversation threads using the Responses API,
 * replacing the functionality previously provided by the Assistants API.
 * 
 * Key features:
 * - Conversation session management with response IDs
 * - Message history tracking and retrieval
 * - Consistent conversation state with server-side persistence
 */

import { openai, createResponse, createStreamingResponse } from "@/frontend/openai";
import { ResponseMessage } from "openai/resources/responses/responses";
import streamHandler from "@/frontend/utils/stream-handler";

/**
 * Conversation thread interface with message history
 */
export interface Thread {
  id: string;
  created: number;
  messages: ThreadMessage[];
  latestResponseId?: string;
  model?: string;
}

/**
 * Message in a conversation thread
 */
export interface ThreadMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  toolCalls?: any[];
}

/**
 * Create a new conversation thread
 * @returns The new thread object
 */
export async function createThread(): Promise<Thread> {
  try {
    // Create an initial empty response to establish a conversation
    const response = await createResponse("", { 
      store: true 
    });

    return {
      id: response.id,
      created: response.created,
      messages: [],
      latestResponseId: response.id,
      model: response.model
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

/**
 * Add a user message to a thread and get the assistant's response
 * @param threadId The thread ID (response ID) to continue the conversation
 * @param content The user message content
 * @param options Additional options for the response
 * @returns Stream of the assistant's response
 */
export async function sendMessageToThread(
  threadId: string,
  content: string,
  options: {
    model?: string;
    tools?: Array<{ type: string; [key: string]: any }>;
    stream?: boolean;
  } = {}
) {
  try {
    const { model, tools = [], stream = true } = options;

    if (stream) {
      const streamResponse = await createStreamingResponse(content, {
        previousResponseId: threadId,
        model,
        store: true,
        tools: tools.length > 0 ? tools : undefined
      });
      
      // Register stream for potential interruption
      streamHandler.registerStream(streamResponse.id, streamResponse);
      
      return streamResponse;
    } else {
      return await createResponse(content, {
        previousResponseId: threadId,
        model,
        store: true,
        tools: tools.length > 0 ? tools : undefined
      });
    }
  } catch (error) {
    console.error("Error sending message to thread:", error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

/**
 * Retrieves messages from a thread using the messages contained in responses
 * @param threadId The thread ID to retrieve messages from
 * @returns Array of messages in the thread
 */
export async function getThreadMessages(threadId: string): Promise<ThreadMessage[]> {
  try {
    // The Responses API doesn't have a direct way to list messages from a conversation
    // We need to manually retrieve the response chain

    // Start with the most recent response ID
    let currentResponseId = threadId;
    const messages: ThreadMessage[] = [];
    const processedIds = new Set<string>(); // Track processed IDs to avoid loops

    // Follow the chain of responses backward
    while (currentResponseId && !processedIds.has(currentResponseId)) {
      processedIds.add(currentResponseId);
      
      try {
        // Get the response details
        const response = await openai.responses.retrieve(currentResponseId);
        
        // Process response input (user message)
        if (response.input && typeof response.input === 'string') {
          // Add user message if it's a string
          messages.unshift({
            id: `user_${response.id}`,
            role: 'user',
            content: response.input,
            created: response.created
          });
        } else if (Array.isArray(response.input)) {
          // Handle array input (multiple messages in the input)
          for (const item of response.input) {
            if (item.role === 'user' && item.content) {
              messages.unshift({
                id: `user_${response.id}_${messages.length}`,
                role: 'user',
                content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
                created: response.created
              });
            }
          }
        }
        
        // Process response message (assistant message)
        if (response.message) {
          const toolCalls = response.message.tool_calls || [];
          
          messages.unshift({
            id: response.id,
            role: 'assistant',
            content: response.message.content || '',
            created: response.created,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined
          });
        }
        
        // Move to the previous response in the chain
        currentResponseId = response.previous_response_id;
      } catch (error) {
        console.error(`Error retrieving response ${currentResponseId}:`, error);
        break; // Exit the loop if we encounter an error retrieving a response
      }
    }

    return messages;
  } catch (error) {
    console.error("Error retrieving thread messages:", error);
    throw new Error(`Failed to retrieve messages: ${error.message}`);
  }
}

/**
 * Process tool calls from a response and submit the results
 * @param responseId The response ID containing tool calls
 * @param toolOutputs The tool outputs to submit
 * @param options Additional options for the response
 * @returns Stream of the continued conversation
 */
export async function submitToolOutputs(
  responseId: string,
  toolOutputs: Array<{ tool_call_id: string; output: string }>,
  options: { model?: string; stream?: boolean } = {}
) {
  try {
    const { model, stream = true } = options;

    // Get the response to determine which tools were used
    const response = await openai.responses.retrieve(responseId);
    const toolCalls = response.message?.tool_calls || [];
    
    // Create a tools array from the tool calls
    const tools = toolCalls.map(call => {
      if (call.type === 'function') {
        return { type: 'function', function: { name: call.function.name } };
      }
      return { type: call.type };
    });

    // Create a continued conversation with the tool outputs
    if (stream) {
      const streamResponse = await createStreamingResponse("", {
        model,
        previousResponseId: responseId,
        store: true,
        tools: tools.length > 0 ? tools : undefined
      });
      
      // Register stream for potential interruption
      streamHandler.registerStream(streamResponse.id, streamResponse);
      
      // Submit the tool outputs to the stream
      if (streamResponse && typeof streamResponse.submitToolOutputs === 'function') {
        try {
          streamResponse.submitToolOutputs(toolOutputs);
        } catch (toolError) {
          console.error("Error submitting tool outputs:", toolError);
        }
      }
      
      return streamResponse;
    } else {
      // Non-streaming version
      const continueResponse = await createResponse("", {
        model,
        previousResponseId: responseId,
        store: true,
        tools: tools.length > 0 ? tools : undefined
      });
      
      // The non-streaming version doesn't support submitToolOutputs
      // Users should use the streaming version for tool outputs
      console.warn("Tool outputs can only be submitted with streaming responses");
      
      return continueResponse;
    }
  } catch (error) {
    console.error("Error submitting tool outputs:", error);
    throw new Error(`Failed to submit tool outputs: ${error.message}`);
  }
}

/**
 * Get a thread by ID, including its message history
 * @param threadId The thread ID to retrieve
 * @returns The thread object with messages
 */
export async function getThread(threadId: string): Promise<Thread> {
  try {
    // Retrieve the initial response to get thread metadata
    const response = await openai.responses.retrieve(threadId);
    
    // Get all messages in the thread
    const messages = await getThreadMessages(threadId);
    
    return {
      id: threadId,
      created: response.created,
      messages,
      latestResponseId: response.id,
      model: response.model
    };
  } catch (error) {
    console.error("Error retrieving thread:", error);
    throw new Error(`Failed to retrieve thread: ${error.message}`);
  }
}

/**
 * Default export of the thread manager
 */
const threadManager = {
  createThread,
  sendMessageToThread,
  getThreadMessages,
  submitToolOutputs,
  getThread
};

export default threadManager;