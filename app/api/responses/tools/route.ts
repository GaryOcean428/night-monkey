import { createStreamingResponse } from "@/app/openai";
import { handleToolCalls } from "@/app/tools-config";

export const runtime = "nodejs";

/**
 * POST /api/responses/tools
 * 
 * Handles tool calls from the Responses API and continues the conversation
 */
export async function POST(request: Request) {
  try {
    const { 
      responseId,
      toolCalls,
      input,
      stream = true
    } = await request.json();

    if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
      throw new Error("Invalid or missing tool calls");
    }

    if (!responseId) {
      throw new Error("Missing responseId");
    }

    // Process tool calls from the response
    const toolOutputs = await handleToolCalls(toolCalls);

    // Continue the conversation with the tool outputs
    const streamResponse = await createStreamingResponse(input || "", {
      previousResponseId: responseId,
      tools: toolCalls.map(call => 
        call.type === 'function' 
          ? { type: 'function', function: { name: call.function.name } } 
          : { type: call.type }
      )
    });
    
    // Submit tool outputs to the ongoing conversation with null check
    if (streamResponse && typeof streamResponse.submitToolOutputs === 'function') {
      try {
        streamResponse.submitToolOutputs(toolOutputs);
      } catch (toolError) {
        console.error("Error submitting tool outputs:", toolError);
        // Continue with the stream even if tool output submission fails
      }
    }
    
    return new Response(streamResponse.toReadableStream());
  } catch (error) {
    console.error("Error in responses tools API:", error);
    return Response.json({ 
      error: error.message || "An error occurred processing tool calls"
    }, { status: 500 });
  }
}