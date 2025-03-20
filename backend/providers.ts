/**
 * AI Providers Configuration
 * 
 * This file manages the configuration for different AI providers:
 * - OpenAI
 * - Anthropic
 * - Google
 * - Groq
 * - Perplexity
 * 
 * It sets up client instances for each provider and provides unified interfaces.
 */

import OpenAI from "openai";
import { Provider } from "@/backend/model-router";

// Initialize OpenAI client
export const openai = new OpenAI();

// Function to check if a provider is configured
export function isProviderConfigured(provider: Provider): boolean {
  switch (provider) {
    case Provider.OPENAI:
      return !!process.env.OPENAI_API_KEY;
    case Provider.ANTHROPIC:
      return !!process.env.ANTHROPIC_API_KEY;
    case Provider.GOOGLE:
      return !!process.env.GOOGLE_API_KEY;
    case Provider.META:
      return !!process.env.GROQ_API_KEY; // Llama models via Groq
    case Provider.PERPLEXITY:
      return !!process.env.PERPLEXITY_API_KEY;
    default:
      return false;
  }
}

// Get available providers
export function getAvailableProviders(): Provider[] {
  return Object.values(Provider).filter(provider => isProviderConfigured(provider));
}

// Determine if a model is available based on the configured providers
export function isModelAvailable(modelName: string): boolean {
  // OpenAI models
  if (modelName.startsWith('gpt-') || modelName === 'o1') {
    return isProviderConfigured(Provider.OPENAI);
  }
  
  // Anthropic models
  if (modelName.includes('claude')) {
    return isProviderConfigured(Provider.ANTHROPIC);
  }
  
  // Google models
  if (modelName.includes('gemini')) {
    return isProviderConfigured(Provider.GOOGLE);
  }
  
  // Llama models (via Groq)
  if (modelName.includes('llama')) {
    return isProviderConfigured(Provider.META);
  }
  
  // Perplexity models
  if (modelName.includes('sonar')) {
    return isProviderConfigured(Provider.PERPLEXITY);
  }
  
  return false;
}

/**
 * Get available client for a provider
 * This will be expanded as we add support for more providers
 */
export function getProviderClient(provider: Provider): any {
  switch (provider) {
    case Provider.OPENAI:
      return openai;
    // Other providers will be added as we implement them
    default:
      throw new Error(`Client for provider ${provider} is not yet implemented`);
  }
}

/**
 * Default export with provider utilities
 */
const providers = {
  openai,
  isProviderConfigured,
  getAvailableProviders,
  isModelAvailable,
  getProviderClient
};

export default providers;