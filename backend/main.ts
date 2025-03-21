/**
 * Backend Entry Point
 * 
 * This file serves as the entry point for the backend server.
 * In a Next.js application, this file is not directly executed,
 * but it's useful to have a clear entry point for documenting
 * the backend structure and for potential future separation.
 */

import { openai } from "@/backend/openai";
import streamHandler from "@/backend/utils/stream-handler";
import fs from 'fs';
import path from 'path';

// Initialize any necessary backend services
const initBackend = () => {
  // Set up error handling for the OpenAI client
  if (!process.env.OPENAI_API_KEY) {
    console.warn("Warning: OPENAI_API_KEY environment variable not set");
  }
  
  // Initialize any other services or databases here
  
  // Log initialization
  console.log("Backend services initialized");
  
  return {
    openai,
    streamHandler,
  };
};

// Function to check for the existence of Serverless Functions
const checkServerlessFunctions = () => {
  const functionsPath = path.join(__dirname, 'api');
  const functionFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith('.ts'));
  return functionFiles.length > 0;
};

// Export commonly used utilities and configurations
export { openai };
export * from "@/backend/tools-config";
export * from "@/backend/model-router";

// Export the thread management utilities
export * from "@/backend/utils/stream-handler";

// Export the checkServerlessFunctions function
export { checkServerlessFunctions };

// Export the initialized backend
export const backend = initBackend();

// Export default for direct imports
export default backend;
