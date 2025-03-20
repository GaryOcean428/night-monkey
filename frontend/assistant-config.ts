// Import from the frontend
import { openai } from "@/frontend/openai";

export let assistantId = ""; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
