import { OpenAI } from 'openai';
import { HealthProfile, PersonalizedHealthPlan, DetailedNutritionPlan } from '../../shared/schema';

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
  specialty?: "pediatric" | "heart" | "ortho" | "general";
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
    The JSON object MUST contain ONLY the following keys: "urgency", "conditions", "suggestions", "message", "followUpQuestion", "specialty".
    
    { 
      "urgency": "mild" | "moderate" | "severe",
      "specialty": "pediatric" | "heart" | "ortho" | "general",
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
        conditions: [{ 
          name: "Unknown", 
          likelihood: "Low", 
          explanation: "Unable to determine conditions from the provided symptoms." 
        }],
        suggestions: [{ 
          text: "Please consult with a healthcare provider for proper evaluation", 
          isWarning: true,
          reasoning: "Unable to properly analyze symptoms"
        }],
        message: "I apologize, but I couldn't properly analyze your symptoms. For accurate health advice, please consult with a healthcare professional.",
        followUpQuestion: "Could you provide more specific details about your symptoms?",
        specialty: "general" // Adding the required specialty field with a default value
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
        followUpQuestion: "Could you please try describing your symptoms again?", // Default value
        specialty: 'general'
      };
  }
}

/**
 * Generates a personalized health plan using OpenAI based on the user's profile.
 * @param healthProfileContext String summary of the user's health profile.
 * @returns A promise resolving to the PersonalizedHealthPlan object.
 */
export async function generatePersonalizedPlan(
  healthProfileContext: string
): Promise<PersonalizedHealthPlan> {
  const systemPrompt = `You are MediAI, an AI health assistant specializing in creating personalized health plans.
    Based ONLY on the provided User Health Profile Context, generate a comprehensive and actionable health plan.

    --- User Health Profile Context ---
    ${healthProfileContext}
    --- End User Health Profile Context ---

    **Task:** Create a personalized health plan focusing on actionable advice. Analyze the profile data (BMI, conditions, habits, etc.) to identify key risk areas and tailor recommendations.

    **IMPORTANT RESPONSE FORMAT:**
    Your response MUST be ONLY a single, valid JSON object conforming EXACTLY to the following structure.
    DO NOT include any text, explanation, apologies, or markdown formatting before or after the JSON object.
    The JSON object MUST contain ONLY the keys defined in the structure below. Ensure all string fields provide meaningful content, and arrays contain relevant items based on the profile.

    {
      "overallSummary": string, /* Concise overview of health status based on profile and key goals (e.g., weight management, managing cholesterol) */
      "keyMetricsFocus": string[], /* List the top 2-3 metrics the user should focus on (e.g., "BMI", "Blood Pressure", "Blood Sugar") based on their profile */
      "riskHighlights": [{ "risk": string, "explanation": string, "severity": "Low" | "Moderate" | "High" }], /* Identify key health risks evident from the profile (e.g., high BMI, sedentary lifestyle, high cholesterol) and explain briefly. Assign severity based on profile data. */
      "dietRecommendations": [{ "recommendation": string, "reasoning": string }], /* Provide specific, actionable dietary advice relevant to the profile (e.g., based on diet type, weight, conditions like high cholesterol/blood sugar). */
      "exerciseRecommendations": [{ "recommendation": string, "reasoning": string }], /* Suggest specific types and frequencies of exercise suitable for the user's activity level, BMI, and goals. */
      "preventiveCare": [{ "suggestion": string, "frequency": string (optional), "reasoning": string }], /* Recommend relevant health screenings or check-ups based on age (if available), gender, risks. */
      "mentalWellness": [{ "suggestion": string, "reasoning": string }], /* Offer 1-2 general mental wellness tips, potentially linked to stress level if provided. */
      "disclaimer": "This plan provides general suggestions based on your profile and is not a substitute for professional medical advice. Consult with healthcare professionals before making significant health changes."
    }
    --- END IMPORTANT RESPONSE FORMAT ---

    **Guidelines:**
    - Be specific and actionable in recommendations.
    - Directly link recommendations and risks to data points in the provided profile.
    - If profile data is missing for a section (e.g., no mental health info), provide general advice or omit the section/leave the array empty if appropriate, but the JSON key must still exist.
    - Prioritize recommendations based on the most significant factors in the profile (e.g., very high BMI, specific chronic conditions).
    - Ensure the final output is precisely the requested JSON structure and nothing else.`;

  try {
    console.log("Generating personalized plan with profile context:\n", healthProfileContext);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Or your preferred model
      messages: [
        { role: "system", content: systemPrompt },
        // No user message needed here as the profile is in the system prompt
      ],
      temperature: 0.6, // Slightly creative but focused
      // Enforce JSON output
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("OpenAI returned an empty response.");
    }

    console.log("Raw OpenAI plan response:", responseContent);

    // Parse the JSON response
    try {
      // Since we requested json_object, the content should be valid JSON
      const plan = JSON.parse(responseContent) as PersonalizedHealthPlan;
      // Basic validation
      if (plan.overallSummary && plan.riskHighlights && plan.dietRecommendations && plan.exerciseRecommendations && plan.disclaimer) {
         return plan;
      } else {
        throw new Error("Parsed JSON does not match expected PersonalizedHealthPlan structure.");
      }
    } catch (parseError) {
      console.error("Error parsing JSON from OpenAI plan response:", parseError);
      console.error("Invalid JSON received:", responseContent); // Log the invalid JSON
      throw new Error("Failed to parse valid JSON plan from OpenAI response.");
    }
  } catch (error) {
    console.error("Error generating personalized plan with OpenAI:", error);
    // Rethrow or return a default error structure if needed, but rethrowing is often better here
    throw new Error(`Failed to generate personalized plan: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateDetailedNutritionPlan(formattedProfile: string): Promise<DetailedNutritionPlan> {
  console.log("Generating detailed nutrition plan with OpenAI...");

  const systemPrompt = `
    You are a helpful AI assistant specialized in nutrition. Based on the provided user health profile, generate a detailed, personalized nutrition plan.

    The user's health profile is summarized below:
    --- PROFILE START ---
    ${formattedProfile}
    --- PROFILE END ---

    Your response MUST be a valid JSON object adhering strictly to the following TypeScript interface:

    interface DetailedNutritionPlan {
      overallGoal: string; // e.g., Weight loss, muscle gain, general health, manage diabetes
      calorieTarget: number; // Estimated daily calorie goal
      macronutrientTargets: {
        proteinGrams: number;
        carbohydrateGrams: number;
        fatGrams: number;
      };
      mealPlan: {
        breakfast: { suggestions: string[]; notes?: string };
        lunch: { suggestions: string[]; notes?: string };
        dinner: { suggestions: string[]; notes?: string };
        snacks: { suggestions: string[]; notes?: string };
      };
      hydrationGoalLiters: number;
      keyMicronutrientsFocus: string[]; // e.g., Iron, Vitamin D, Calcium
      generalAdvice: string[]; // Other tips like meal timing, food prep, supplements etc.
      disclaimer: string; // Standard disclaimer about consulting professionals
    }

    Provide practical and actionable suggestions. Estimate targets based on the profile, but keep them reasonable. Include a standard disclaimer advising consultation with healthcare professionals.
    Return ONLY the JSON object, nothing else.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Or your preferred model
      messages: [
        { role: "system", content: systemPrompt },
      ],
      temperature: 0.6, // Adjust for creativity vs consistency
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI returned an empty response for nutrition plan.');
    }

    console.log("Received raw nutrition plan JSON from OpenAI:", content);

    try {
      const parsedPlan: DetailedNutritionPlan = JSON.parse(content);
      // Basic validation (can be expanded)
      if (!parsedPlan.overallGoal || !parsedPlan.mealPlan || !parsedPlan.disclaimer) {
         throw new Error('Parsed nutrition plan JSON is missing required fields.');
      }
      console.log("Successfully parsed detailed nutrition plan.");
      return parsedPlan;
    } catch (parseError: any) {
       console.error("Error parsing nutrition plan JSON from OpenAI:", parseError);
       throw new Error(`Failed to parse valid JSON for nutrition plan from AI response. Raw response: ${content}`);
    }

  } catch (error: any) {
    console.error("Error generating detailed nutrition plan with OpenAI:", error);
    throw new Error(`OpenAI API error while generating detailed nutrition plan: ${error.message}`);
  }
}
