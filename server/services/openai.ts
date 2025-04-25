import OpenAI from "openai";

// Handle API key with type safety
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Defines the structure of the JSON response expected from the OpenAI API.
 */
interface SymptomAnalysisResult {
  urgency: "mild" | "moderate" | "severe";
  conditions: Array<{ name: string; likelihood: "High" | "Moderate" | "Low"; explanation: string }>;
  suggestions: Array<{ text: string; isWarning: boolean; reasoning: string }>;
  message: string;
  followUpQuestion: string;
}

/**
 * Analyzes user symptoms using OpenAI's GPT-4o model, incorporating conversation history and user health profile.
 * @param symptoms The latest user symptoms to analyze.
 * @param conversationHistory An array of previous messages in the conversation.
 * @param healthProfileContext An optional string containing the user's health profile.
 * @returns A promise resolving to the SymptomAnalysisResult object.
 */
export async function analyzeSymptoms(
  symptoms: string,
  conversationHistory: Array<{ role: string; content: string }>, // Keep same input structure
  healthProfileContext?: string // Add optional health profile context
): Promise<SymptomAnalysisResult> {
  try {
    // Map conversation history roles for OpenAI (system, assistant, user)
    // Gemini used 'model' for assistant role, OpenAI uses 'assistant'
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = conversationHistory.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : (msg.role as 'system' | 'user' | 'assistant'), // Map 'model' to 'assistant'
        content: msg.content
    }));

console.log("healthProfileContext", healthProfileContext);
    // Add the current symptoms analysis request as the last user message
    // Construct the system prompt similar to the Gemini one
    const systemPrompt = `You are MediAI, an AI health assistant designed to analyze symptoms and provide helpful information.
    Important: You are NOT providing medical diagnosis and must always include appropriate disclaimers.

    ${healthProfileContext ? `--- User Health Profile Context ---\n${healthProfileContext}\n--- End User Health Profile Context ---` : 'User health profile not provided.'}

    Analyze the user's latest message regarding their symptoms.
    Consider the entire conversation history provided.
    ${healthProfileContext ? '**Critically, consider how the symptoms relate to the provided User Health Profile Context.** For example, factor in age, gender, height, weight, existing conditions, allergies, medications, etc., when assessing potential causes and suggesting care.' : ''}

    Provide:
    1. An urgency assessment (mild, moderate, or severe)
    2. Potential conditions that might cause these symptoms (always include likelihood: High, Moderate, or Low). Provide a brief explanation for each condition.
    3. Detailed care suggestions. Explain the reasoning behind each suggestion.
    4. A follow-up question to gather more relevant information

    --- IMPORTANT RESPONSE FORMAT --- 
    Your response MUST be ONLY a single, valid JSON object conforming EXACTLY to the following structure. 
    DO NOT include any text, explanation, apologies, or markdown formatting before or after the JSON object. 
    The JSON object MUST contain ONLY the following keys: "urgency", "conditions", "suggestions", "message", "followUpQuestion".
    
    { 
      "urgency": "mild" | "moderate" | "severe",
      "conditions": [{ "name": string, "likelihood": "High" | "Moderate" | "Low", "explanation": string }],
      "suggestions": [{ "text": string, "isWarning": boolean, "reasoning": string }],
      "message": string, /* A comprehensive summary message for the user, explaining the key findings and advice. Please Elaborate this to alot */
      "followUpQuestion": string
    }
    --- END IMPORTANT RESPONSE FORMAT --- 

    Guidelines:
    - Be conversational, empathetic, and professional in the 'message' field. Make it comprehensive.
    - Never diagnose, only suggest possibilities in 'conditions'.
    - For severe symptoms, recommend immediate medical attention in 'suggestions' and set 'urgency' to 'severe'.
    - Base analysis on medical knowledge.
    - Always express medical caution.
    - Include warnings in 'suggestions' if needed.
    - Avoid making dangerous assumptions.
    - Ensure the final output is precisely the requested JSON structure and nothing else.`;

    // Add the system prompt and the latest user symptoms to the message list
    const requestMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...messages, // Add existing conversation history
        { role: "user", content: `Here are my current symptoms: "${symptoms}" Please analyze them.` } // Add the latest symptoms
    ];


    // Use GPT-4o model and request JSON output format
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o which supports JSON mode
      messages: requestMessages,
      response_format: { type: "json_object" }, // Request JSON output
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("OpenAI response content is empty.");
    }

    console.log("Raw OpenAI response:", responseContent);

    // Parse the JSON response
    try {
      // Since we requested json_object, the content should be valid JSON
      return JSON.parse(responseContent) as SymptomAnalysisResult;
    } catch (parseError) {
      console.error("Error parsing JSON from OpenAI response:", parseError);
      // Fallback response if parsing fails
      return {
        urgency: "mild",
        conditions: [{ name: "Unable to analyze symptoms", likelihood: "Low", explanation: "An error occurred while analyzing the symptoms." }],
        suggestions: [{
          text: "Please consult with a healthcare provider for proper evaluation",
          isWarning: true,
          reasoning: "A healthcare professional can provide a more accurate diagnosis and treatment plan."
        }],
        message: "I apologize, but I encountered an issue processing the analysis. For accurate health advice, please consult with a healthcare professional.",
        followUpQuestion: "Could you clarify your symptoms?"
      };
    }
  } catch (error) {
    console.error("Error analyzing symptoms with OpenAI:", error);
    // Provide a user-friendly fallback that conforms to SymptomAnalysisResult
     return {
        urgency: "mild", // Default value
        conditions: [], // Default empty array
        suggestions: [], // Default empty array
        message: `Sorry, I encountered an error trying to analyze the symptoms: ${error instanceof Error ? error.message : String(error)}. Please try again or consult a healthcare professional directly.`, // Put error in message
        followUpQuestion: "Could you please try describing your symptoms again?" // Default value
      };
  }
}
