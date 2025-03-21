import { openai } from "@/backend/openai";
import { checkServerlessFunctions } from "@/backend/main";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const serverlessFunctionsExist = await checkServerlessFunctions();
  if (!serverlessFunctionsExist) {
    return Response.json({ error: "No Serverless Functions found" }, { status: 404 });
  }

  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant.",
    name: "Quickstart Assistant",
    model: "gpt-4o",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Determine weather in my location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["c", "f"],
              },
            },
            required: ["location"],
          },
        },
      },
      { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
