import { openai, createResponse } from "@/backend/openai";
import { checkServerlessFunctions } from "@/backend/main";

export const runtime = "nodejs";

/**
 * POST /api/assistants/threads
 * 
 * Create a new conversation session using the Responses API
 * This replaces the threads.create functionality from the Beta API
 */
export async function POST() {
  try {
    const serverlessFunctionsExist = await checkServerlessFunctions();
    if (!serverlessFunctionsExist) {
      return Response.json({ error: "No Serverless Functions found" }, { status: 404 });
    }

    // Create an initial empty response to establish a conversation
    // Using store: true ensures the response is persisted server-side
    const response = await createResponse("", {
      store: true
    });
    
    // The response ID will be used as our thread ID equivalent
    return Response.json({ 
      threadId: response.id,
      // Include additional response data for future reference
      model: response.model,
      created: response.created
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return Response.json({ 
      error: error.message || "Failed to create conversation thread",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
