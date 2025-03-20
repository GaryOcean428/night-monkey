import { createStreamingResponse, defaultModel } from "@/backend/openai";
import { availableTools } from "@/backend/tools-config";

export const runtime = "nodejs";

/**
 * POST /api/assistants/threads/[threadId]/messages
 * 
 * Send a new message to an existing conversation thread
 * Uses the Responses API with streaming response
 */
export async function POST(request, { params: { threadId } }) {
  try {
    // Extract request parameters
    const { 
      content, 
      model = defaultModel,
      enabledTools = ["weather"] // Default to weather tool 
    } = await request.json();

    if (!content) {
      throw new Error("Message content is required");
    }

    // Convert enabled tool names to actual tool configurations
    const tools = enabledTools.map(toolName => {
      const tool = availableTools[toolName];
      if (!tool) {
        console.warn(`Unknown tool requested: ${toolName}`);
        return null;
      }
      return tool;
    }).filter(Boolean);

    // Create a streaming response that continues the conversation
    // The threadId parameter is used as the previousResponseId
    const stream = await createStreamingResponse(content, {
      model,
      previousResponseId: threadId,
      store: true, // Ensure server-side state is maintained
      tools: tools.length > 0 ? tools : undefined
    });

    return new Response(stream.toReadableStream());
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ 
      error: error.message || "Failed to send message",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
