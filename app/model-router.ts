/**
 * Advanced Model Router - Selection System for AI Models
 * 
 * This module implements a system that automatically selects the appropriate AI model
 * based on task characteristics, context size, and specialized capabilities.
 * It implements the model routing system described in the modernization plan.
 */

// Model capability matrix - defines what each model is good at
const MODEL_CAPABILITIES = {
  // OpenAI models
  'gpt-4o': {
    multimodal: true,
    textGeneration: 9.2,
    reasoning: 8.5,
    coding: 8.5,
    contextSize: 128000,
    toolUse: true,
    responseLatency: 'low'
  },
  'gpt-o3': {
    multimodal: true,
    textGeneration: 9.5,
    reasoning: 9.3,
    coding: 9.0,
    contextSize: 200000,
    toolUse: true,
    responseLatency: 'low'
  },
  'gpt-4-turbo': {
    multimodal: true,
    textGeneration: 8.8,
    reasoning: 8.0,
    coding: 8.0,
    contextSize: 128000,
    toolUse: true,
    responseLatency: 'medium'
  },
  'gpt-4.5-preview': {
    multimodal: true,
    textGeneration: 9.4,
    reasoning: 9.0,
    coding: 8.8,
    contextSize: 128000,
    toolUse: true,
    responseLatency: 'low',
    responsesApi: true
  },
  'o1': {
    multimodal: true,
    textGeneration: 9.7,
    reasoning: 9.6,
    coding: 9.4,
    contextSize: 200000,
    toolUse: true,
    responseLatency: 'low',
    computerUse: true
  },

  // Anthropic models
  'claude-3-7-sonnet-20250219': {
    multimodal: true,
    textGeneration: 9.3,
    reasoning: 9.1,
    coding: 8.9,
    contextSize: 200000,
    toolUse: true,
    responseLatency: 'low',
    computerUse: true
  },
  'claude-3-5-opus-20240620': {
    multimodal: true,
    textGeneration: 9.5,
    reasoning: 9.4,
    coding: 8.8,
    contextSize: 200000,
    toolUse: true,
    responseLatency: 'medium'
  },
  'claude-3-5-haiku-20240307': {
    multimodal: true,
    textGeneration: 8.6,
    reasoning: 8.3,
    coding: 7.9,
    contextSize: 200000,
    toolUse: true,
    responseLatency: 'very-low'
  },

  // Google models
  'gemini-2.0-flash-thinking-exp': {
    multimodal: true,
    textGeneration: 9.1,
    reasoning: 9.2,
    coding: 8.7,
    contextSize: 1000000,
    toolUse: true,
    responseLatency: 'low',
    streamingThinking: true
  },
  'gemini-2.0-pro-experimental': {
    multimodal: true,
    textGeneration: 9.3,
    reasoning: 9.0,
    coding: 9.1,
    contextSize: 2000000,
    toolUse: true,
    responseLatency: 'medium',
    videoProcessing: true
  },
  'gemini-2.0-flash-lite': {
    multimodal: true,
    textGeneration: 8.5,
    reasoning: 8.0,
    coding: 7.8,
    contextSize: 1000000,
    toolUse: true,
    responseLatency: 'very-low'
  },

  // Other models
  'llama-3.3-70b-versatile': {
    multimodal: true,
    textGeneration: 8.7,
    reasoning: 8.4,
    coding: 8.2,
    contextSize: 128000,
    toolUse: true,
    responseLatency: 'medium'
  },
  'llama-3.1-sonar-huge-128k-online': {
    multimodal: true,
    textGeneration: 8.8,
    reasoning: 8.5,
    coding: 8.3,
    contextSize: 127000,
    toolUse: true,
    responseLatency: 'medium',
    webSearch: true
  }
};

// Task type definitions
export enum TaskType {
  GENERAL_CONVERSATION = 'general_conversation',
  CREATIVE_WRITING = 'creative_writing',
  CODE_GENERATION = 'code_generation',
  CODE_EXPLANATION = 'code_explanation',
  COMPLEX_REASONING = 'complex_reasoning',
  DATA_ANALYSIS = 'data_analysis',
  TOOL_USE = 'tool_use',
  MULTIMODAL = 'multimodal',
  SEARCH_AUGMENTED = 'search_augmented',
  COMPUTER_USE = 'computer_use',
  REALTIME_STREAMING = 'realtime_streaming'
}

// Model cost tiers (for cost-aware routing)
enum CostTier {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Provider enum
export enum Provider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  META = 'meta',
  PERPLEXITY = 'perplexity'
}

// Cost mapping
const MODEL_COSTS: Record<string, CostTier> = {
  'gpt-4o': CostTier.MEDIUM,
  'gpt-o3': CostTier.HIGH,
  'gpt-4-turbo': CostTier.MEDIUM,
  'gpt-4.5-preview': CostTier.MEDIUM,
  'o1': CostTier.HIGH,
  'claude-3-7-sonnet-20250219': CostTier.HIGH,
  'claude-3-5-opus-20240620': CostTier.HIGH,
  'claude-3-5-haiku-20240307': CostTier.MEDIUM,
  'gemini-2.0-flash-thinking-exp': CostTier.HIGH,
  'gemini-2.0-pro-experimental': CostTier.HIGH,
  'gemini-2.0-flash-lite': CostTier.MEDIUM,
  'llama-3.3-70b-versatile': CostTier.MEDIUM,
  'llama-3.1-sonar-huge-128k-online': CostTier.MEDIUM
};

// Provider mapping
const MODEL_PROVIDERS: Record<string, Provider> = {
  'gpt-4o': Provider.OPENAI,
  'gpt-o3': Provider.OPENAI,
  'gpt-4-turbo': Provider.OPENAI,
  'gpt-4.5-preview': Provider.OPENAI,
  'o1': Provider.OPENAI,
  'claude-3-7-sonnet-20250219': Provider.ANTHROPIC,
  'claude-3-5-opus-20240620': Provider.ANTHROPIC,
  'claude-3-5-haiku-20240307': Provider.ANTHROPIC,
  'gemini-2.0-flash-thinking-exp': Provider.GOOGLE,
  'gemini-2.0-pro-experimental': Provider.GOOGLE,
  'gemini-2.0-flash-lite': Provider.GOOGLE,
  'llama-3.3-70b-versatile': Provider.META,
  'llama-3.1-sonar-huge-128k-online': Provider.PERPLEXITY
};

interface ModelRoutingOptions {
  taskType: TaskType;
  contextLength?: number;
  preferredProvider?: Provider;
  maxCostTier?: CostTier;
  requireResponses?: boolean;
  requireComputerUse?: boolean;
  requireStreamingThinking?: boolean;
  requireWebSearch?: boolean;
}

/**
 * Simple keyword-based task classifier
 * In a production system, this would be a more sophisticated ML model
 */
export function classifyTask(input: string): TaskType {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('code') && 
      (lowerInput.includes('write') || lowerInput.includes('generate') || lowerInput.includes('create'))) {
    return TaskType.CODE_GENERATION;
  }
  
  if (lowerInput.includes('code') && 
      (lowerInput.includes('explain') || lowerInput.includes('understand'))) {
    return TaskType.CODE_EXPLANATION;
  }
  
  if (lowerInput.includes('search') || 
      lowerInput.includes('find information') || 
      lowerInput.includes('look up')) {
    return TaskType.SEARCH_AUGMENTED;
  }
  
  if (lowerInput.includes('analyze') && 
      (lowerInput.includes('data') || lowerInput.includes('results'))) {
    return TaskType.DATA_ANALYSIS;
  }
  
  if (lowerInput.includes('write') || 
      lowerInput.includes('story') || 
      lowerInput.includes('creative')) {
    return TaskType.CREATIVE_WRITING;
  }
  
  if (lowerInput.includes('complex') || 
      lowerInput.includes('difficult') || 
      lowerInput.includes('challenging')) {
    return TaskType.COMPLEX_REASONING;
  }
  
  if (lowerInput.includes('use computer') || 
      lowerInput.includes('control desktop') || 
      lowerInput.includes('run program')) {
    return TaskType.COMPUTER_USE;
  }
  
  if (lowerInput.includes('streaming') || 
      lowerInput.includes('real-time') || 
      lowerInput.includes('live')) {
    return TaskType.REALTIME_STREAMING;
  }
  
  if (lowerInput.includes('image') || 
      lowerInput.includes('picture') || 
      lowerInput.includes('photo')) {
    return TaskType.MULTIMODAL;
  }
  
  return TaskType.GENERAL_CONVERSATION;
}

/**
 * Selects the best model for a given task based on various criteria
 */
export function selectModel(options: ModelRoutingOptions): string {
  const {
    taskType,
    contextLength = 0,
    preferredProvider,
    maxCostTier = CostTier.HIGH,
    requireResponses = false,
    requireComputerUse = false,
    requireStreamingThinking = false,
    requireWebSearch = false
  } = options;

  // Filter models by context length
  let eligibleModels = Object.entries(MODEL_CAPABILITIES)
    .filter(([_, capabilities]) => capabilities.contextSize >= contextLength);

  // Filter by preferred provider if specified
  if (preferredProvider) {
    eligibleModels = eligibleModels.filter(([model]) => 
      MODEL_PROVIDERS[model] === preferredProvider
    );
  }

  // Filter by cost tier
  eligibleModels = eligibleModels.filter(([model]) => 
    costTierRank(MODEL_COSTS[model]) <= costTierRank(maxCostTier)
  );

  // Filter by specific feature requirements
  if (requireResponses) {
    eligibleModels = eligibleModels.filter(([_, capabilities]) => 
      capabilities.responsesApi === true
    );
  }

  if (requireComputerUse) {
    eligibleModels = eligibleModels.filter(([_, capabilities]) => 
      capabilities.computerUse === true
    );
  }

  if (requireStreamingThinking) {
    eligibleModels = eligibleModels.filter(([_, capabilities]) => 
      capabilities.streamingThinking === true
    );
  }

  if (requireWebSearch) {
    eligibleModels = eligibleModels.filter(([_, capabilities]) => 
      capabilities.webSearch === true
    );
  }

  // If no models meet all criteria, relax constraints
  if (eligibleModels.length === 0) {
    // Return a default model that's most likely to work
    return 'gpt-4o';
  }

  // Sort eligible models by their capability for the task type
  const sortedModels = eligibleModels.sort((a, b) => {
    const [modelA, capabilitiesA] = a;
    const [modelB, capabilitiesB] = b;
    
    // Calculate scores for each model based on task type
    const scoreA = getTaskScore(capabilitiesA, taskType);
    const scoreB = getTaskScore(capabilitiesB, taskType);
    
    // Break ties by preferring lower cost
    if (scoreB === scoreA) {
      return costTierRank(MODEL_COSTS[modelA]) - costTierRank(MODEL_COSTS[modelB]);
    }
    
    return scoreB - scoreA;
  });

  // Return the best model
  return sortedModels[0][0];
}

/**
 * Helper to get model scores for specific task types
 */
function getTaskScore(capabilities: any, taskType: TaskType): number {
  switch (taskType) {
    case TaskType.CODE_GENERATION:
    case TaskType.CODE_EXPLANATION:
      return capabilities.coding * 1.5 + capabilities.reasoning * 0.5;
    
    case TaskType.CREATIVE_WRITING:
      return capabilities.textGeneration * 1.5 + capabilities.reasoning * 0.3;
    
    case TaskType.COMPLEX_REASONING:
      return capabilities.reasoning * 1.5 + capabilities.textGeneration * 0.3;
    
    case TaskType.DATA_ANALYSIS:
      return capabilities.reasoning * 1.2 + capabilities.coding * 0.8;
    
    case TaskType.TOOL_USE:
      return capabilities.toolUse ? 10 : 0;
    
    case TaskType.MULTIMODAL:
      return capabilities.multimodal ? 10 : 0;
    
    case TaskType.COMPUTER_USE:
      return capabilities.computerUse ? 10 : 0;
    
    case TaskType.SEARCH_AUGMENTED:
      return capabilities.webSearch ? 10 : 0;
    
    case TaskType.REALTIME_STREAMING:
      return responseLatencyScore(capabilities.responseLatency) * 1.5;
    
    case TaskType.GENERAL_CONVERSATION:
    default:
      return capabilities.textGeneration + capabilities.reasoning;
  }
}

/**
 * Helper to convert cost tier to numeric rank
 */
function costTierRank(tier: CostTier): number {
  switch (tier) {
    case CostTier.LOW: return 1;
    case CostTier.MEDIUM: return 2;
    case CostTier.HIGH: return 3;
    default: return 3;
  }
}

/**
 * Helper to score response latency
 */
function responseLatencyScore(latency: string): number {
  switch (latency) {
    case 'very-low': return 10;
    case 'low': return 8;
    case 'medium': return 5;
    case 'high': return 2;
    default: return 5;
  }
}

/**
 * Get provider for a model
 */
export function getModelProvider(model: string): Provider {
  return MODEL_PROVIDERS[model] || Provider.OPENAI;
}

/**
 * Check if a model is supported by the current implementation
 */
export function isModelSupported(model: string): boolean {
  return MODEL_PROVIDERS[model] === Provider.OPENAI;
}

/**
 * Default export - the advanced model router
 */
const modelRouter = {
  selectModel,
  classifyTask,
  getModelProvider,
  isModelSupported,
  TaskType,
  Provider
};

export default modelRouter;