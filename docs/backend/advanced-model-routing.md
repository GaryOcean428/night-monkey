# Advanced Model Routing

This document outlines an intelligent model routing system that automatically selects the most appropriate AI model for each user query without requiring manual model selection.

## Overview

Modern AI applications benefit from using different models for different tasks based on their specialized capabilities. Rather than requiring users to manually select models, we can implement an intelligent routing system that:

1. Analyzes incoming queries
2. Determines task requirements and complexity
3. Selects the optimal model based on capabilities and cost considerations

## Implementation Strategy

### 1. Task Classification System

```javascript
// Sample implementation of task classifier
const classifyQuery = (query) => {
  // Patterns for different task types
  const patterns = {
    coding: /code|function|programming|javascript|python|algorithm|bug|error|debug/i,
    creative: /story|write|creative|imagine|design|generate/i,
    reasoning: /explain|reason|analyze|why|how|evaluate|compare|contrast/i,
    math: /math|calculate|equation|solve|formula|computation/i,
    visual: /image|photo|picture|diagram|chart|graph/i,
    multimodal: /image.*text|text.*image|audio|voice|transcribe/i,
    realtime: /stream|fast|quick|immediate|conversation|chat/i
  };

  // Determine complexity (token count, nested questions, etc.)
  const complexity = assessComplexity(query);
  
  // Match query against patterns
  const matchedCategories = Object.entries(patterns)
    .filter(([_, pattern]) => pattern.test(query))
    .map(([category]) => category);

  return {
    categories: matchedCategories.length > 0 ? matchedCategories : ['general'],
    complexity
  };
};
```

### 2. Model Capability Matrix

Create a capability matrix that maps models to their strengths and calibrates for evolving capabilities:

```javascript
const modelCapabilities = {
  'gpt-4o': {
    coding: 0.9,
    creative: 0.85,
    reasoning: 0.9,
    math: 0.8,
    visual: 0.9,
    multimodal: 0.95,
    realtime: 0.8,
    complexity: {
      max: 'very high',
      contextWindow: 128000
    },
    costIndex: 0.8
  },
  'gpt-o3': {
    coding: 0.95,
    creative: 0.8,
    reasoning: 0.95,
    math: 0.95,
    visual: 0.7,
    multimodal: 0.7,
    realtime: 0.65,
    complexity: {
      max: 'very high',
      contextWindow: 200000
    },
    costIndex: 0.9
  },
  'claude-3-5-sonnet': {
    coding: 0.85,
    creative: 0.9,
    reasoning: 0.85,
    math: 0.8,
    visual: 0.85,
    multimodal: 0.8,
    realtime: 0.85,
    complexity: {
      max: 'high',
      contextWindow: 200000
    },
    costIndex: 0.7
  },
  'claude-3-5-haiku': {
    coding: 0.8,
    creative: 0.8,
    reasoning: 0.75,
    math: 0.7,
    visual: 0.8,
    multimodal: 0.75,
    realtime: 0.95,
    complexity: {
      max: 'medium',
      contextWindow: 200000
    },
    costIndex: 0.4
  },
  'gemini-2-pro': {
    coding: 0.85,
    creative: 0.75,
    reasoning: 0.8,
    math: 0.85,
    visual: 0.8,
    multimodal: 0.85,
    realtime: 0.7,
    complexity: {
      max: 'high',
      contextWindow: 2000000
    },
    costIndex: 0.6
  },
  'gemini-2-flash': {
    coding: 0.75,
    creative: 0.7,
    reasoning: 0.7,
    math: 0.75,
    visual: 0.75,
    multimodal: 0.8,
    realtime: 0.9,
    complexity: {
      max: 'medium',
      contextWindow: 1000000
    },
    costIndex: 0.3
  }
};
```

### 3. Capability Calibration System

As models evolve, their capabilities need recalibration. Implement a dynamic calibration system:

```javascript
const calibrateModelCapabilities = () => {
  // Fetch latest benchmark results from internal API
  const benchmarks = fetchBenchmarkResults();
  
  // Update model capability scores
  Object.keys(modelCapabilities).forEach(model => {
    if (benchmarks[model]) {
      // Adjust capabilities based on latest performance metrics
      Object.keys(benchmarks[model]).forEach(category => {
        if (modelCapabilities[model][category] !== undefined) {
          modelCapabilities[model][category] = benchmarks[model][category];
        }
      });
    }
  });
  
  // Log calibration event
  console.log('Model capabilities calibrated based on latest benchmarks');
};

// Schedule regular calibration
setInterval(calibrateModelCapabilities, 7 * 24 * 60 * 60 * 1000); // Weekly
```

### 4. Context-Aware Router

The router considers conversation history, previous model performance, and user preferences:

```javascript
const selectModel = (query, context = {}) => {
  const { categories, complexity } = classifyQuery(query);
  
  // Filter models by context window if we can estimate token count
  const tokenCount = estimateTokenCount(query, context.history || []);
  const eligibleModels = Object.entries(modelCapabilities)
    .filter(([_, capabilities]) => capabilities.complexity.contextWindow >= tokenCount)
    .map(([model]) => model);

  // Calculate scores for each model
  const scores = eligibleModels.map(model => {
    // Base score from capability match with task categories
    let score = categories.reduce((sum, category) => 
      sum + (modelCapabilities[model][category] || 0), 0) / categories.length;
    
    // Adjust score based on complexity match
    if (complexity === 'high' && modelCapabilities[model].complexity.max === 'very high') {
      score *= 1.2;
    } else if (complexity === 'low' && modelCapabilities[model].costIndex < 0.5) {
      // Prefer cheaper models for simple tasks
      score *= 1.1;
    }
    
    // Adjust for user preferences if available
    if (context.userPreferences?.model === model) {
      score *= 1.1;
    }
    
    // Adjust for previous successful interactions
    if (context.history?.some(msg => msg.model === model && msg.successful)) {
      score *= 1.05;
    }
    
    return { model, score };
  });
  
  // Select the highest scoring model
  const selectedModel = scores.sort((a, b) => b.score - a.score)[0]?.model || 'gpt-4o';
  
  return {
    model: selectedModel,
    reasoning: `Selected ${selectedModel} based on task categories (${categories.join(', ')}), 
                complexity (${complexity}), and context requirements (${tokenCount} tokens).`
  };
};
```

## Integration with Responses API

The router integrates seamlessly with the OpenAI Responses API:

```javascript
const handleQuery = async (req, res) => {
  const { query, history } = req.body;
  
  // Select the appropriate model
  const { model, reasoning } = selectModel(query, { history });
  
  console.log(`Model router selected ${model}: ${reasoning}`);
  
  // Use the selected model with the Responses API
  const response = await openai.responses.create({
    model: model,
    input: query,
    previous_response_id: history[history.length - 1]?.id,
    store: true
  });
  
  // Return response with model metadata
  res.json({
    ...response,
    _metadata: {
      selected_model: model,
      routing_reason: reasoning
    }
  });
};
```

## Multi-Provider Integration

The routing system works across different providers:

```javascript
const createClientForModel = (model) => {
  // Extract provider from model name
  const provider = model.includes('gpt') || model.includes('o3') ? 'openai' :
                  model.includes('claude') ? 'anthropic' :
                  model.includes('gemini') ? 'google' : 'openai';
  
  // Return appropriate client
  switch (provider) {
    case 'openai':
      return new OpenAI();
    case 'anthropic':
      return new Anthropic();
    case 'google':
      return new GoogleGenAI();
    default:
      return new OpenAI();
  }
};

const queryModel = async (model, query, options = {}) => {
  const client = createClientForModel(model);
  
  switch (true) {
    case model.includes('gpt') || model.includes('o3'):
      return client.responses.create({
        model,
        input: query,
        ...options
      });
    case model.includes('claude'):
      return client.messages.create({
        model,
        messages: [{ role: 'user', content: query }],
        ...options
      });
    case model.includes('gemini'):
      return client.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: query }] }],
        ...options
      });
  }
};
```

## Fallback Strategy

Implement graceful degradation when models are unavailable:

```javascript
const queryWithFallback = async (query, context = {}) => {
  // Get primary model and fallbacks
  const { model } = selectModel(query, context);
  const fallbacks = determineFallbacks(model);
  
  // Try primary model first
  try {
    return await queryModel(model, query, context.options);
  } catch (error) {
    console.error(`Error with ${model}: ${error.message}`);
    
    // Try fallbacks in sequence
    for (const fallbackModel of fallbacks) {
      try {
        console.log(`Trying fallback model: ${fallbackModel}`);
        return await queryModel(fallbackModel, query, context.options);
      } catch (fallbackError) {
        console.error(`Error with fallback ${fallbackModel}: ${fallbackError.message}`);
      }
    }
    
    // If all models fail, throw error
    throw new Error('All models failed to process the query');
  }
};
```

## Performance Monitoring

Track model performance to continually refine routing decisions:

```javascript
const trackModelPerformance = (model, query, response, metrics = {}) => {
  // Store performance data
  const performanceData = {
    model,
    timestamp: Date.now(),
    query_type: classifyQuery(query).categories,
    latency: metrics.latency || 0,
    tokens: {
      input: metrics.inputTokens || 0,
      output: metrics.outputTokens || 0
    },
    cost: calculateCost(model, metrics.inputTokens, metrics.outputTokens),
    success: metrics.success || true
  };
  
  // Store in database for analysis
  db.modelPerformance.insert(performanceData);
  
  // Periodically analyze to adjust routing weights
  if (shouldRecalibrateModels()) {
    recalibrateModelWeights();
  }
};
```

## User Interface Considerations

While the routing happens automatically, provide transparency to users:

1. Display the selected model in the UI with explanation
2. Allow users to override the selection if desired
3. Provide feedback mechanism to improve routing accuracy
4. Show performance metrics for tech-savvy users

## Best Practices

1. **Regularly Calibrate**: Update model capabilities as new benchmarks become available
2. **Cost Management**: Balance performance with cost considerations, especially for high-volume applications
3. **Response Time**: Consider latency requirements when selecting models
4. **Monitor Performance**: Track which models perform best for which query types
5. **User Overrides**: Allow manual selection for edge cases while learning from these exceptions
6. **A/B Testing**: Continuously test different routing algorithms to optimize selection
7. **Provider Reliability**: Factor in service reliability when selecting between providers