import { openai } from "@/backend/providers";

// Re-export the OpenAI client so it can be imported from this file
export { openai };

// Default model to use for responses according to .clinerules models
export const defaultModel = "gpt-4o";

/**
 * Comprehensive OpenAI Models List (2025)
 * Excluding older and base models as requested
 */
export const openaiModels = {
  // GPT-4o Series
  gpt4o: {
    "gpt-4o": {
      description: "Latest multimodal model optimized for text, vision, and audio tasks with 128K context",
      contextWindow: 128000,
      inputPrice: 0.005, // per 1K tokens
      outputPrice: 0.015, // per 1K tokens
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools"]
    },
    "gpt-4o-mini": {
      description: "Smaller, faster version of GPT-4o with strong capabilities at a lower cost",
      contextWindow: 128000,
      inputPrice: 0.0015,
      outputPrice: 0.006,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools"]
    }
  },
  
  // O Series Models (Advanced Reasoning)
  oSeries: {
    "o1": {
      description: "Multi-step reasoning model for intricate problems, with computer use capabilities",
      contextWindow: 200000,
      inputPrice: 0.008,
      outputPrice: 0.024,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools", "computer-use"]
    },
    "o1-mini": {
      description: "Smaller version of o1 with strong reasoning capabilities at lower cost",
      contextWindow: 180000,
      inputPrice: 0.006,
      outputPrice: 0.018,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools", "computer-use"]
    },
    "o1-pro": {
      description: "Enhanced version of o1 with improved reasoning and specialized domain expertise",
      contextWindow: 220000,
      inputPrice: 0.010,
      outputPrice: 0.030,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools", "computer-use", "expert-reasoning"]
    },
    "gpt-o3": {
      description: "Advanced reasoning model specialized for STEM domains, research analysis, and coding",
      contextWindow: 200000,
      inputPrice: 0.008,
      outputPrice: 0.024,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools"]
    },
    "gpt-o3-mini": {
      description: "Efficient version of gpt-o3 for STEM applications at reduced cost",
      contextWindow: 180000,
      inputPrice: 0.006,
      outputPrice: 0.018,
      vision: true,
      audio: true,
      capabilities: ["chat", "vision", "editing", "tools"]
    }
  },
  
  // GPT-4.5 Series
  gpt45: {
    "gpt-4.5-preview": {
      description: "Creative model for open-ended conversations with real-time responses API",
      contextWindow: 128000,
      inputPrice: 0.006,
      outputPrice: 0.018,
      vision: true,
      audio: false,
      capabilities: ["chat", "vision", "editing", "tools"]
    },
    "gpt-4.5-turbo": {
      description: "High-performance variant optimized for faster processing with strong general capabilities",
      contextWindow: 128000,
      inputPrice: 0.006,
      outputPrice: 0.018,
      vision: true,
      audio: false,
      capabilities: ["chat", "vision", "editing", "tools"]
    }
  },
  
  // Embeddings Models
  embeddings: {
    "text-embedding-3-large": {
      description: "Most capable embedding model for semantic search, text similarity, and code search",
      contextWindow: 8191,
      dimensions: 3072,
      price: 0.00013, // per 1K tokens
      capabilities: ["embeddings"]
    },
    "text-embedding-3-small": {
      description: "Efficient embedding model balancing quality and cost",
      contextWindow: 8191,
      dimensions: 1536,
      price: 0.00002, // per 1K tokens
      capabilities: ["embeddings"]
    }
  },
  
  // Audio Models
  audio: {
    "whisper-3": {
      description: "Latest speech recognition model with enhanced multilingual capabilities",
      price: 0.002, // per minute (rounded to nearest second)
      capabilities: ["speech-to-text", "translation"]
    },
    "tts-1-hd": {
      description: "High-fidelity text-to-speech model with natural prosody",
      price: 0.015, // per 1K characters
      capabilities: ["text-to-speech"]
    },
    "tts-1": {
      description: "Standard text-to-speech model balancing quality and cost",
      price: 0.005, // per 1K characters
      capabilities: ["text-to-speech"]
    }
  },
  
  // Image Models
  image: {
    "dall-e-3": {
      description: "Most powerful text-to-image model with high realism and accurate text rendering",
      capabilities: ["text-to-image"],
      priceBySize: {
        "1024x1024": 0.040,
        "1024x1792": 0.080,
        "1792x1024": 0.080
      }
    },
    "dall-e-2": {
      description: "Cost-effective text-to-image model with good quality for simpler applications",
      capabilities: ["text-to-image"],
      priceBySize: {
        "1024x1024": 0.020,
        "512x512": 0.018,
        "256x256": 0.016
      }
    }
  },
  
  // Moderation Models
  moderation: {
    "text-moderation-latest": {
      description: "Most capable content moderation model for detecting harmful content",
      price: 0.0000, // free
      capabilities: ["moderation"]
    },
    "text-moderation-stable": {
      description: "Stable model version offering consistent moderation results",
      price: 0.0000, // free
      capabilities: ["moderation"]
    }
  }
};

/**
 * Supported models based on .clinerules
 * Models are organized by provider for easy selection
 */
export const supportedModels = {
  // OpenAI models
  openai: [
    "o1",                // Multi-step reasoning for intricate problems, computer use
    "o1-pro",            // Enhanced reasoning with specialized domain expertise
    "o1-mini",           // Efficient reasoning at lower cost
    "gpt-4o",            // Multimodal processing for text, images, and audio
    "gpt-4o-mini",       // Smaller, faster GPT-4o
    "gpt-o3",            // Advanced reasoning for STEM domains, research and coding
    "gpt-o3-mini",       // Efficient STEM reasoning at reduced cost
    "gpt-4.5-preview",   // Creative tasks, open-ended conversations
    "gpt-4.5-turbo",     // High-performance general capabilities
  ],

  // Anthropic models
  anthropic: [
    "claude-3-7-sonnet-20250219", // Advanced intelligence, text/image input, coding, agentic tools
    "claude-3-5-opus-20240620",   // Advanced reasoning for complex tasks with longer outputs
    "claude-3-5-haiku-20240307",  // High-speed interactions, text processing, simple code completions
  ],

  // Google models
  google: [
    "gemini-2.0-flash-thinking-exp", // Complex reasoning, visible thought process, real-time streaming
    "gemini-2.0-pro-experimental",   // Advanced coding tasks, long document analysis, video processing
    "gemini-2.0-flash-lite",         // Cost-efficient high-volume operations
  ],

  // Groq/Meta models
  groq: [
    "llama-3.3-70b-versatile", // General-purpose tasks requiring versatility
  ],

  // Perplexity models
  perplexity: [
    "llama-3.1-sonar-huge-128k-online", // Real-time, search-augmented tasks needing up-to-date information
  ]
};

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
