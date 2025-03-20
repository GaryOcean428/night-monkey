import { openai } from "@/backend/openai";

type WeatherUnit = 'celsius' | 'fahrenheit';
type WeatherResponse = {
  location: string;
  temperature: number;
  unit: string;
  conditions: string;
  timestamp: string;
};

/**
 * Simulated weather API that returns random weather data
 * 
 * @param location - The city/location to get weather for
 * @param unit - The temperature unit (celsius or fahrenheit)
 * @returns Weather data including temperature and conditions
 */
const getWeather = (location: string, unit: WeatherUnit = 'fahrenheit'): WeatherResponse => {
  if (!location || typeof location !== 'string') {
    throw new Error('Invalid location provided');
  }
  
  // Temperature range based on unit
  let minTemp = unit === 'celsius' ? 10 : 50;
  let maxTemp = unit === 'celsius' ? 30 : 86;
  
  // Choose a random temperature and condition
  const randomTemperature = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
  const randomConditionIndex = Math.floor(Math.random() * 5);
  const conditions = ["Cloudy", "Sunny", "Rainy", "Snowy", "Windy"];

  return {
    location: location,
    temperature: randomTemperature,
    unit: unit === 'celsius' ? 'C' : 'F',
    conditions: conditions[randomConditionIndex],
    timestamp: new Date().toISOString()
  };
};

export { getWeather };
