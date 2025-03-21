import { openai, createResponse } from "@/backend/openai";

export const runtime = "nodejs";

/**
 * GET /api/assistants/threads/[threadId]
 * 
 * Retrieve the details of a specific conversation thread
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const threadId = url.pathname.split("/").pop();

    if (!threadId) {
      return Response.json({ 
        error: "Thread ID is required" 
      }, { status: 400 });
    }

    const response = await openai.responses.retrieve(threadId);

    return Response.json({ 
      threadId: response.id,
      model: response.model,
      created: response.created,
      messages: response.messages
    });
  } catch (error) {
    console.error("Error retrieving conversation thread:", error);
    return Response.json({ 
      error: error.message || "Failed to retrieve conversation thread",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/assistants/threads/[threadId]
 * 
 * Add a new message to an existing conversation thread
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const threadId = url.pathname.split("/").pop();
    const { input, model = "gpt-4o" } = await request.json();

    if (!threadId) {
      return Response.json({ 
        error: "Thread ID is required" 
      }, { status: 400 });
    }

    if (!input) {
      return Response.json({ 
        error: "Input message is required" 
      }, { status: 400 });
    }

    const response = await createResponse(input, {
      model,
      previousResponseId: threadId,
      store: true
    });

    return Response.json({ 
      threadId: response.id,
      model: response.model,
      created: response.created,
      messages: response.messages
    });
  } catch (error) {
    console.error("Error adding message to conversation thread:", error);
    return Response.json({ 
      error: error.message || "Failed to add message to conversation thread",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
