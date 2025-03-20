import { openai } from "./providers";

// Default model to use for responses
// This can be updated with other models like "gpt-o3", "claude-3-7-sonnet-20250219", etc.
// based on the requirements in .clinerules
export const defaultModel = "gpt-4o";

// Helper function to create a response using the Responses API
export const createResponse = async (
  input: string | Array<{role: string, content: string}>,
  options: {
    model?: string;
    previousResponseId?: string;
    store?: boolean;
    tools?: Array<{type: string, [key: string]: any}>;
  } = {}
) => {
  const { 
    model = defaultModel, 
    previousResponseId, 
    store = true,
    tools = []
  } = options;

  return await openai.responses.create({
    model,
    input,
    previous_response_id: previousResponseId,
    store,
    tools: tools.length > 0 ? tools : undefined
  });
};

// Helper function to create a streaming response
export const createStreamingResponse = async (
  input: string | Array<{role: string, content: string}>,
  options: {
    model?: string;
    previousResponseId?: string;
    store?: boolean;
    tools?: Array<{type: string, [key: string]: any}>;
  } = {}
) => {
  const { 
    model = defaultModel, 
    previousResponseId, 
    store = true,
    tools = []
  } = options;

  return await openai.responses.stream({
    model,
    input,
    previous_response_id: previousResponseId,
    store,
    tools: tools.length > 0 ? tools : undefined
  });
};
