/**
 * Stream Handler for Responses API Streams
 *
 * This utility provides functions for working with streaming responses,
 * including interruption handling and error management.
 */

import { ResponsesStream } from "openai/lib/ResponsesStream";
import { openai } from "@/backend/openai";

// Map to store active streams with their IDs
const activeStreams = new Map<string, ResponsesStream>();

/**
 * Register a new active stream for potential interruption
 * @param streamId Unique identifier for the stream
 * @param stream The stream to register
 */
export function registerStream(streamId: string, stream: ResponsesStream): void {
  // Close any existing stream with the same ID
  if (activeStreams.has(streamId)) {
    try {
      const existingStream = activeStreams.get(streamId);
      existingStream?.controller.abort();
      activeStreams.delete(streamId);
    } catch (error) {
      console.error(`Error closing existing stream ${streamId}:`, error);
    }
  }
  
  // Register the new stream
  activeStreams.set(streamId, stream);
  
  // Set up automatic cleanup when the stream ends
  stream.on("end", () => {
    activeStreams.delete(streamId);
  });
  
  stream.on("error", () => {
    activeStreams.delete(streamId);
  });
}

/**
 * Interrupt a specific active stream
 * @param streamId The ID of the stream to interrupt
 * @returns True if the stream was interrupted, false otherwise
 */
export function interruptStream(streamId: string): boolean {
  if (!activeStreams.has(streamId)) {
    return false;
  }
  
  try {
    const stream = activeStreams.get(streamId);
    stream?.controller.abort();
    activeStreams.delete(streamId);
    return true;
  } catch (error) {
    console.error(`Error interrupting stream ${streamId}:`, error);
    return false;
  }
}

/**
 * Interrupt all active streams
 * @returns The number of streams interrupted
 */
export function interruptAllStreams(): number {
  const count = activeStreams.size;
  
  for (const [streamId, stream] of activeStreams.entries()) {
    try {
      stream.controller.abort();
    } catch (error) {
      console.error(`Error interrupting stream ${streamId}:`, error);
    }
  }
  
  activeStreams.clear();
  return count;
}

/**
 * Get the count of active streams
 * @returns The number of active streams
 */
export function getActiveStreamCount(): number {
  return activeStreams.size;
}

/**
 * Check if a specific stream is active
 * @param streamId The ID of the stream to check
 * @returns True if the stream is active, false otherwise
 */
export function isStreamActive(streamId: string): boolean {
  return activeStreams.has(streamId);
}

/**
 * Default export with all stream handling utilities
 */
const streamHandler = {
  registerStream,
  interruptStream,
  interruptAllStreams,
  getActiveStreamCount,
  isStreamActive
};

export default streamHandler;