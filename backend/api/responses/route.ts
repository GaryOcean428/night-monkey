import { createResponse, createStreamingResponse, defaultModel } from "@/backend/openai";
import modelRouter, { TaskType, Provider } from "@/backend/model-router";
import providers, { isModelAvailable } from "@/backend/providers";
import { checkServerlessFunctions } from "@/backend/main";

export const runtime = "nodejs";

/**
 * POST /api/responses
 * 
 * Creates a new chat response using the OpenAI Responses API
 * This replaces the Assistants API threads functionality
 * 
 * In future versions, this will support multiple providers (Anthropic, Google, etc.)
 */
export async function POST(request: Request) {
  try {
    const serverlessFunctionsExist = await checkServerlessFunctions();
    if (!serverlessFunctionsExist) {
      return Response.json({ error: "No Serverless Functions found" }, { status: 404 });
    }

    const { 
      input, 
      model = defaultModel, 
      previousResponseId,
      store = true,
      stream = true,
      tools = []
    } = await request.json();

    // Validate request
    if (!input) {
      throw new Error("Input is required");
    }
    
    // If no model specified, use task-based model selection
    let selectedModel = model;
    if (!selectedModel) {
      // Use the first message in the input to classify the task
      const userMessage = Array.isArray(input) 
        ? input.find(msg => msg.role === 'user')?.content || ""
        : input;
        
      // Classify task and select appropriate model
      const taskType = modelRouter.classifyTask(typeof userMessage === 'string' ? userMessage : "");
      selectedModel = modelRouter.selectModel({
        taskType,
        requireResponses: true
      });
    }
    
    // Check if model's provider is configured
    if (!isModelAvailable(selectedModel)) {
      // Return informative error about missing API key
      const providerName = modelRouter.getModelProvider(selectedModel);
      return Response.json({
        error: `Model ${selectedModel} requires ${providerName} API key to be configured in .env.local file.`
      }, { status: 400 });
    }
    
    // Check if model is supported by the current implementation
    if (!modelRouter.isModelSupported(selectedModel)) {
      // For now, we'll return an informative error, but in the future
      // we'll route to the appropriate provider client
      return Response.json({
        error: `Model ${selectedModel} implementation is not yet available. Support coming soon.`
      }, { status: 400 });
    }

    // If streaming is requested
    if (stream) {
      const streamResponse = await createStreamingResponse(input, {
        model: selectedModel,
        previousResponseId,
        store,
        tools: tools && tools.length > 0 ? tools : undefined
      });
      
      return new Response(streamResponse.toReadableStream());
    }
    
    // Non-streaming response
    const response = await createResponse(input, {
      model: selectedModel,
      previousResponseId,
      store,
      tools: tools && tools.length > 0 ? tools : undefined
    });
    
    return Response.json({ response });
  } catch (error) {
    console.error("Error in responses API:", error);
    return Response.json({ 
      error: error.message || "An unknown error occurred",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
