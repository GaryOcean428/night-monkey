import { getWeather } from "@/app/utils/weather";

/**
 * Function tool definition for weather data
 */
export const weatherTool = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "The unit of temperature to use. Infer this from the user's location.",
        },
      },
      required: ["location", "unit"],
    },
  },
};

/**
 * Web search tool definition
 */
export const webSearchTool = {
  type: "web_search"
};

/**
 * Code interpreter tool definition
 */
export const codeInterpreterTool = {
  type: "code_interpreter"
};

/**
 * Available tools map for easy access
 */
export const availableTools = {
  weather: weatherTool,
  webSearch: webSearchTool,
  codeInterpreter: codeInterpreterTool
};

/**
 * Process function call for weather tool
 */
export const processWeatherToolCall = async (args: any) => {
  try {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments for weather tool');
    }
    
    const { location, unit } = args;
    
    if (!location) {
      throw new Error('Location is required for weather tool');
    }
    
    // Validate unit (defaulting to fahrenheit if invalid)
    const validUnit = unit === 'celsius' || unit === 'fahrenheit' ? unit : 'fahrenheit';
    
    const weatherData = await getWeather(location, validUnit);
    return JSON.stringify(weatherData);
  } catch (error) {
    console.error("Error getting weather data:", error);
    return JSON.stringify({ 
      error: error.message || "Failed to get weather data",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Handle tool calls from Responses API
 */
export const handleToolCalls = async (toolCalls: any[]) => {
  if (!toolCalls || !Array.isArray(toolCalls)) {
    throw new Error('Tool calls must be an array');
  }

  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    try {
      if (!toolCall || !toolCall.type || !toolCall.id) {
        console.warn('Invalid tool call object, skipping', toolCall);
        continue;
      }

      if (toolCall.type === "function") {
        if (!toolCall.function || !toolCall.function.name) {
          console.warn('Invalid function call, missing name', toolCall);
          continue;
        }

        const functionName = toolCall.function.name;
        let args = {};
        
        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch (parseError) {
          console.error('Error parsing function arguments:', parseError);
          // Continue with empty args
        }

        let result;
        switch (functionName) {
          case "get_weather":
            result = await processWeatherToolCall(args);
            break;
          default:
            result = JSON.stringify({ 
              error: `Unknown function: ${functionName}`,
              timestamp: new Date().toISOString()
            });
        }

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: result
        });
      } else {
        // Handle other tool types if needed
        console.warn(`Unhandled tool type: ${toolCall.type}`);
      }
    } catch (error) {
      console.error(`Error processing tool call:`, error, toolCall);
      
      // Add error output for this tool call
      if (toolCall && toolCall.id) {
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({ 
            error: `Error processing tool call: ${error.message || 'Unknown error'}`,
            timestamp: new Date().toISOString()
          })
        });
      }
    }
  }

  return toolOutputs;
};