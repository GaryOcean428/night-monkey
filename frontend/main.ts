/**
 * Frontend Entry Point
 * 
 * This file serves as the entry point for the frontend application.
 * It exports commonly used utilities and services for the frontend.
 */

import { openai, defaultModel, supportedModels } from "@/frontend/openai";
import threadManager from "@/frontend/utils/thread-manager";

// Initialize any necessary frontend services
const initFrontend = () => {
  // Initialize any frontend-specific services here
  
  // Log initialization
  console.log("Frontend services initialized");
  
  return {
    openai,
    defaultModel,
    supportedModels,
    threadManager,
  };
};

// Export commonly used utilities and configurations
export { openai, defaultModel, supportedModels };
export * from "@/frontend/tools-config";
export * from "@/frontend/assistant-config";

// Export the thread management utilities
export { threadManager };

// Export the initialized frontend
export const frontend = initFrontend();

// Export default for direct imports
export default frontend;