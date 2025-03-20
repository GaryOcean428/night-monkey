import { createStreamingResponse, defaultModel } from "@/backend/openai";
import { handleToolCalls } from "@/backend/tools-config";

export const runtime = "nodejs";

/**
 * POST /api/assistants/threads/[threadId]/actions
 * 
 * Process tool calls from the AI and submit tool outputs
 * This replaces the submitToolOutputs functionality from the Beta API
 */
export async function POST(request, { params: { threadId } }) {
  try {
    const { toolCalls, responseId, model = defaultModel } = await request.json();

    if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
      throw new Error("Invalid or missing tool calls");
    }

    if (!responseId) {
      throw new Error("Response ID is required");
    }

    // Process the tool calls to get outputs
    const toolOutputs = await handleToolCalls(toolCalls);

    // Create a new streaming response that continues the conversation
    const stream = await createStreamingResponse("", {
      model,
      previousResponseId: responseId,
      store: true,
      // Include the same tools that were used in the previous response
      tools: toolCalls.map(call => 
        call.type === 'function' 
          ? { type: 'function', function: { name: call.function.name } } 
          : { type: call.type }
      )
    });
    
    // Submit tool outputs to the ongoing conversation
    if (stream && typeof stream.submitToolOutputs === 'function') {
      try {
        stream.submitToolOutputs(toolOutputs);
      } catch (toolError) {
        console.error("Error submitting tool outputs:", toolError);
        // Continue with the stream even if tool submission fails
      }
    }

    return new Response(stream.toReadableStream());
  } catch (error) {
    console.error("Error processing actions:", error);
    return Response.json({ 
      error: error.message || "Failed to process actions",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
