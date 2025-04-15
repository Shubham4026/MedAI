import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const messages = [
      {
        role: "system",
        content: `You are MediAI, an AI health assistant designed to analyze symptoms and provide helpful information. 
        Important: You are NOT providing medical diagnosis and must always include appropriate disclaimers.
        
        Analyze the user's symptoms and provide:
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
        `,
      },
      ...conversationHistory,
      {
        role: "user",
        content: `Here are my symptoms: ${symptoms}. Please analyze them.`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as SymptomAnalysisResult;
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    throw new Error(`Failed to analyze symptoms: ${error instanceof Error ? error.message : String(error)}`);
  }
}
