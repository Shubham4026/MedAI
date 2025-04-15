import { GoogleGenerativeAI } from "@google/generative-ai";

// Handle API key with type safety
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface Condition {
  name: string;
  likelihood: "High" | "Moderate" | "Low";
}

export interface Suggestion {
  text: string;
  isWarning: boolean;
}

export interface SymptomAnalysisResult {
  urgency: "mild" | "moderate" | "severe";
  conditions: Condition[];
  suggestions: Suggestion[];
  message: string;
  followUpQuestion: string;
}

export async function analyzeSymptoms(
  symptoms: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<SymptomAnalysisResult> {
  try {
    // Use the correct Gemini 1.5 Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create the system prompt with detailed instructions
    const systemPrompt = `You are MediAI, an AI health assistant designed to analyze symptoms and provide helpful information. 
    Important: You are NOT providing medical diagnosis and must always include appropriate disclaimers.
    
    Analyze the following symptoms: "${symptoms}"
    
    Provide:
    1. An urgency assessment (mild, moderate, or severe)
    2. Potential conditions that might cause these symptoms (always include likelihood: High, Moderate, or Low)
    3. Care suggestions
    4. A follow-up question to gather more information
    
    Format your response as a JSON object with the following structure:
    {
      "urgency": "mild" | "moderate" | "severe",
      "conditions": [{ "name": string, "likelihood": "High" | "Moderate" | "Low" }],
      "suggestions": [{ "text": string, "isWarning": boolean }],
      "message": string,
      "followUpQuestion": string
    }
    
    Guidelines:
    - Be conversational but professional
    - Never diagnose, only suggest possibilities
    - For severe symptoms, always recommend immediate medical attention
    - Base analysis on medical knowledge, not guesses
    - Take into account the full conversation history when available
    - Always express medical caution and encourage professional consultation for persistent symptoms
    - Include warnings about when to seek immediate medical attention
    - Avoid makuing too much dangerous assumptions about the symptoms
    
    Response must be valid JSON. Do not include markdown code blocks or any other text outside the JSON structure.`;

    // Generate a response directly using the model
    const result = await model.generateContent([systemPrompt]);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     responseText.match(/{[\s\S]*?}/);
    
    let jsonStr = '';
    if (jsonMatch) {
      jsonStr = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
    } else {
      jsonStr = responseText;
    }

    console.log("Raw response:", responseText);
    console.log("Extracted JSON:", jsonStr);

    // Try to parse the JSON
    try {
      return JSON.parse(jsonStr) as SymptomAnalysisResult;
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini response:", parseError);
      
      // Fallback with a simple response if JSON parsing fails
      return {
        urgency: "mild",
        conditions: [{ name: "Unable to analyze symptoms", likelihood: "Low" }],
        suggestions: [{ 
          text: "Please consult with a healthcare provider for proper evaluation", 
          isWarning: true 
        }],
        message: "I apologize, but I couldn't properly analyze your symptoms. For accurate health advice, please consult with a healthcare professional.",
        followUpQuestion: "Could you provide more specific details about your symptoms?"
      };
    }
  } catch (error) {
    console.error("Error analyzing symptoms with Gemini:", error);
    throw new Error(`Failed to analyze symptoms with Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }
}