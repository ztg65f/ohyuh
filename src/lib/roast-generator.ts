import { parseRoastData, type RoastData } from '@/data/roast-templates';

export interface GenerationSettings {
  roastPercentage: number;
  scenario1Percentage: number;
  scenario2Percentage: number;
}

// Parse the data once when the module loads
const roastData = parseRoastData();

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to choose output type based on percentages
function chooseOutputType(settings: GenerationSettings): 'roast' | 'scenario1' | 'scenario2' {
  const total = settings.roastPercentage + settings.scenario1Percentage + settings.scenario2Percentage;
  const normalizedRoast = (settings.roastPercentage / total) * 100;
  const normalizedScenario1 = (settings.scenario1Percentage / total) * 100;

  const random = Math.random() * 100;

  if (random < normalizedRoast) {
    return 'roast';
  } else if (random < normalizedRoast + normalizedScenario1) {
    return 'scenario1';
  } else {
    return 'scenario2';
  }
}

// Function to replace variables in a template string
function replaceVariables(template: string, data: RoastData): string {
  let result = template;

  // Find all variables in the format [variableName]
  const variablePattern = /\[(\w+)\]/g;
  const matches = template.match(variablePattern);

  if (!matches) return result;

  // Replace each variable with a random value from its corresponding array
  matches.forEach(match => {
    const variableName = match.slice(1, -1); // Remove [ and ]
    const variableArray = data[variableName as keyof RoastData];

    if (variableArray && Array.isArray(variableArray) && variableArray.length > 0) {
      let replacement = getRandomItem(variableArray);

      // Handle nested variables (like [food2] [food])
      if (replacement.includes('[')) {
        replacement = replaceVariables(replacement, data);
      }

      result = result.replace(match, replacement);
    }
  });

  return result;
}

// Main function to generate a roast
export function generateRoast(settings: GenerationSettings): string {
  try {
    // Choose the output type
    const outputType = chooseOutputType(settings);

    // Get templates for the chosen output type
    const templates = roastData[outputType];

    if (!templates || templates.length === 0) {
      return "Error: No templates found for the selected type.";
    }

    // Choose a random template
    const template = getRandomItem(templates);

    // Replace all variables in the template
    const result = replaceVariables(template, roastData);

    return result.charAt(0).toUpperCase() + result.slice(1);
  } catch (error) {
    console.error('Error generating roast:', error);
    return "Error generating roast. Please try again.";
  }
}

// Export the parsed data for debugging if needed
export { roastData };
