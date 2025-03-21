/**
 * API Route for interrupting streaming responses
 * 
 * This route allows clients to interrupt ongoing response streams 
 * from the Responses API.
 */

import streamHandler from "@/backend/utils/stream-handler";

export const runtime = "nodejs";

/**
 * POST /api/responses/interrupt
 * 
 * Interrupts an ongoing response stream
 * Body should contain:
 * - streamId: ID of the stream to interrupt (optional)
 * - interruptAll: Boolean to interrupt all streams (default: false)
 */
export async function POST(request: Request) {
  try {
    const { streamId, interruptAll = false } = await request.json();
    
    // If interruptAll is true, interrupt all streams
    if (interruptAll) {
      const count = streamHandler.interruptAllStreams();
      return Response.json({ 
        success: true, 
        message: `Interrupted ${count} active streams`
      });
    }
    
    // Otherwise, interrupt a specific stream
    if (!streamId) {
      return Response.json({ 
        success: false, 
        error: "Missing streamId parameter" 
      }, { status: 400 });
    }
    
    const interrupted = streamHandler.interruptStream(streamId);
    
    if (interrupted) {
      return Response.json({ 
        success: true, 
        message: `Stream ${streamId} interrupted successfully` 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: `Stream ${streamId} not found or already completed` 
      }, { status: 404 });
    }
  } catch (error) {
    console.error("Error interrupting stream:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Unknown error interrupting stream" 
    }, { status: 500 });
  }
}

/**
 * GET /api/responses/interrupt/status
 * 
 * Returns information about active streams
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const streamId = url.searchParams.get("streamId");
  
  // If streamId is provided, check if that specific stream is active
  if (streamId) {
    const isActive = streamHandler.isStreamActive(streamId);
    return Response.json({ 
      streamId, 
      active: isActive 
    });
  }
  
  // Otherwise, return count of all active streams
  const activeCount = streamHandler.getActiveStreamCount();
  return Response.json({ 
    activeStreams: activeCount 
  });
}
