import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import axios from 'axios';
// Import from the direct OpenAI service
import { analyzeSymptoms, generatePersonalizedPlan, generateDetailedNutritionPlan } from "./services/openai";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { fetchHospitalsFromGoogle } from "./services/googleHospitals";
import { fetchPlaceDetails } from "./services/googleHospitals";
import { Router } from 'express';
import { User, HealthProfile, Conversation, Message, PersonalizedHealthPlan, DetailedNutritionPlan } from '../shared/schema';
import { getFitnessData } from './services/fitness'; // Use Message, remove SymptomAnalysis
import { z } from 'zod';

// Helper function (reuse or adapt from previous logic)
function formatProfileForContext(profile: HealthProfile | null): string {
    if (!profile) return '';

    const profileSummaryLines: string[] = [];
    const skipKeys = ['id', 'userId', 'lastUpdated', 'createdAt', 'updatedAt']; // Keys to skip

    for (const key in profile) {
        if (skipKeys.includes(key)) continue;

        const value = profile[key as keyof HealthProfile];

        if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '') {
            continue; // Skip empty/null fields
        }

        let formattedValue = String(value);
        // Simple camelCase to Title Case conversion
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

        if (Array.isArray(value)) {
            formattedValue = value.join(', ');
        } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
           // Basic object formatting - might need refinement based on actual object structures
           try {
             // Attempt to stringify common nested objects like lifestyleHabits, recentLabResults
             const simpleString = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
             // Limit length to avoid excessive context
             formattedValue = simpleString.length > 150 ? JSON.stringify(value) : `{ ${simpleString} }`;
           } catch {
             formattedValue = JSON.stringify(value); // Fallback
           }
        }
        // Add units
        else if (key === 'height' && typeof value === 'number') formattedValue = `${value} cm`;
        else if (key === 'weight' && typeof value === 'number') formattedValue = `${value} kg`;
        else if (key === 'waterIntakeLiters' && typeof value === 'number') formattedValue = `${value} L`;
        else if (key === 'bmi' && typeof value === 'number') formattedValue = `${value.toFixed(2)}`; // Format BMI

        profileSummaryLines.push(`${formattedKey}: ${formattedValue}`);
    }

    // Return empty string if no details found, otherwise format the summary
    return profileSummaryLines.length > 0 ? `User Health Profile:
${profileSummaryLines.join('\n')}` : '';
}

// Middleware to check if the user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log("[AUTH] isAuthenticated called", req.method, req.originalUrl);
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("[AUTH] Not authenticated");
  return res.status(401).json({ message: "Authentication required" });
}

// Create a new router
const router = Router();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create the HTTP server
  const httpServer = createServer(app);

  // Setup authentication
  setupAuth(app);
  console.log("[ROUTES] registerRoutes called");
  
  // Google OAuth routes
  app.get("/auth/google", passport.authenticate("google", { scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.blood_pressure.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
  ] }));

  app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: '/login',
    failureMessage: true,
    session: true
  }), (req: Request, res: Response) => {
    res.redirect('/health-metrics');
  });


  // Logout route for browser-initiated logout
  app.get("/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: any) => {
      if (err) return next(err);
      req.session?.destroy(() => {
        res.redirect("/login"); // Adjust to your frontend login route
      });
    });
  });

  // Hospitals proxy endpoint (no auth required)
  app.get("/api/hospitals", async (req: Request, res: Response) => {
    try {
      console.log("[GET] /api/hospitals called", req.query);
      const hospitals = await fetchHospitalsFromGoogle(req);
      res.json(hospitals);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch hospitals" });
    }
  });

  // New endpoint for fetching details of a single place (no auth needed)
  app.get("/api/place-details/:placeId", async (req: Request, res: Response) => {
    const { placeId } = req.params;
    if (!placeId) {
      return res.status(400).json({ message: "Missing placeId parameter" });
    }
    try {
      console.log(`[GET] /api/place-details/${placeId} called`);
      const details = await fetchPlaceDetails(placeId);
      res.json(details);
    } catch (error: any) {
      console.error(`Error fetching details for ${placeId}:`, error);
      res.status(500).json({ message: error.message || `Failed to fetch details for place ${placeId}` });
    }
  });

  // User routes - protected by authentication middleware
  app.get("/api/health-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log("[GET] /api/health-profile called", { userId });
      const profile = await storage.getHealthProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Health profile not found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });
  
  app.patch("/api/health-profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userId = req.user!.id;
      console.log("[SHUBHAM] /api/health-profile called", { userId, body: req.body });
      const updates = { ...req.body };
      // Calculate age if dateOfBirth is provided
      if (updates.dateOfBirth) {
        const birthDate = new Date(updates.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        updates.age = age;
      }

      // Update health profile
      const updatedProfile = await storage.updateHealthProfile(userId, updates);
      console.log("[PATCH] Health profile updated", { userId, updates, updatedProfile });
      res.json(updatedProfile);
    } catch (error: any) {
      console.error("Error updating health profile:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/health-metrics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const metrics = await storage.getHealthMetrics(userId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });
  
  app.post("/api/health-metrics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const metric = await storage.createHealthMetric({
        ...req.body,
        userId
      });
      res.status(201).json(metric);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });
  
  // AI-powered autocorrect endpoint
  app.post("/api/autocorrect", async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Missing text" });
    }
    try {
      const prompt = `Correct the grammar and spelling of the following sentence. Only return the corrected sentence.\n\n${text}`;
      const llamaRes = await fetch("http://localhost:11434/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            { role: "system", content: "You are a helpful assistant that corrects grammar and spelling." },
            { role: "user", content: prompt }
          ],
          max_tokens: 128,
          temperature: 0.2
        })
      });
      console.log("comming hereeeeeee........")
      if (!llamaRes.ok) throw new Error("Llama server error");
      const data = await llamaRes.json();
      const corrected = data.choices?.[0]?.message?.content?.trim() || text;
      res.json({ corrected });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to autocorrect" });
    }
  });

  // API routes for conversations
  
  // Update conversation title - requires authentication
  app.patch("/api/conversations/:id/title", isAuthenticated, async (req: Request, res: Response) => {
    console.log("[PATCH] /api/conversations/:id/title called", { params: req.params, body: req.body });
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      if (!title || typeof title !== "string" || !title.trim()) {
        console.log("[PATCH] Invalid title", { title });
        return res.status(400).json({ message: "Title is required" });
      }
      const updated = await storage.updateConversationTitle(id, title.trim());
      if (!updated) {
        console.log("[PATCH] Conversation not found", { id });
        return res.status(404).json({ message: "Conversation not found" });
      }
      console.log("[PATCH] Title updated", { id, title: title.trim() });
      res.json({ success: true, id, title: title.trim() });
    } catch (error: any) {
      console.error("[PATCH] Failed to update title", error);
      res.status(500).json({ message: error.message || "Failed to update title" });
    }
  });

  // Create a new conversation - requires authentication
  app.post("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("POST /api/conversations", { body: req.body, user: req.user });

      const { title, initialMessageContent } = req.body;
      const userId = req.user!.id;

      // Validate optional initialMessageContent
      if (initialMessageContent !== undefined && typeof initialMessageContent !== 'string') {
        return res.status(400).json({ message: "Invalid 'initialMessageContent' format, must be a string." });
      }

      // Use provided title or generate a default one
      const conversationTitle = title || 
                                (initialMessageContent ? initialMessageContent.substring(0, 50) + (initialMessageContent.length > 50 ? '...' : '') : "New Conversation");

      // Create the conversation record
      const conversationData = { title: conversationTitle, userId }; 
      // Ensure this matches what storage.createConversation expects - likely just {title, userId}
      const newConversation = await storage.createConversation(conversationData);

      // Create the initial message IF content was provided and is not empty
      if (initialMessageContent && typeof initialMessageContent === 'string' && initialMessageContent.trim().length > 0) {
        try {
          await storage.createMessage({
            conversationId: newConversation.id,
            role: "user",
            content: initialMessageContent.trim(),
          });
          console.log(`Initial message created for conversation ${newConversation.id}`);
        } catch (messageError: any) {
          console.error(`Error creating initial message for conversation ${newConversation.id}:`, messageError);
          // Logged the error, but proceed to return the created conversation
        }
      }

      // Respond with the newly created conversation object and 201 status
      res.status(201).json(newConversation); 

     } catch (error: any) {
      // Handle validation errors (e.g., if title was required by DB/schema but not provided and no default generated)
      console.error("Error in POST /api/conversations:", error);
      if (error.errors) { // Check for Zod errors if you were parsing
        return res.status(400).json({ message: "Invalid request data.", details: error.errors });
      }
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
     }
   });

  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found in session." });
      }
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Get a conversation by ID
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Add a message to a conversation
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const data = insertMessageSchema.parse({
        ...req.body,
        conversationId
      });
      
      // Save the user message
      const message = await storage.createMessage(data);
      
      // If this is a user message, process it with OpenAI
      if (data.role === "user") {
        // Ensure user is authenticated for this operation
        if (!req.isAuthenticated() || !req.user) {
          console.error("User not authenticated for symptom analysis");
          return res.status(401).json({ message: "Authentication required for symptom analysis." });
        }
        const userId = req.user!.id;

        // Fetch Health Profile
        let healthProfileContext = "";
        try {
          const profile = await storage.getHealthProfile(userId);
          if (profile) {
            // Format profile into plain text, skipping null/empty values
            const profileSummaryLines: string[] = [];
            for (const [key, value] of Object.entries(profile)) {
              // Skip id, userId, lastUpdated, and internal flags like healthScore, riskFlags, bmiCategory
              if (['id', 'userId', 'lastUpdated', 'healthScore', 'riskFlags', 'bmiCategory'].includes(key)) continue;

              let line = '';
              if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    // Capitalize first letter of key for display
                    const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                    line = `${displayKey}: ${value.join(', ')}`;
                  } else {
                    // Optional: Indicate empty arrays explicitly or just skip
                    // line = `${key.charAt(0).toUpperCase() + key.slice(1)}: None`;
                  }
                } else if (typeof value === 'object' && Object.keys(value).length > 0) {
                    // Handle simple objects like lifestyleHabits, recentLabResults
                    const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                    const details = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
                    line = `${displayKey}: ${details}`;
                } else if (String(value).trim() !== '') {
                   const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                   // Add units where appropriate based on key
                   let displayValue = String(value);
                   if (key === 'height') displayValue += ' cm';
                   if (key === 'weight') displayValue += ' kg';
                   if (key === 'waterIntakeLiters') displayValue += ' L';
                   if (key === 'bodyTemperature') displayValue += ' °C'; // Assuming Celsius
                   // ... add more units as needed ...
                   line = `${displayKey}: ${displayValue}`;
                }
              }
              if (line) {
                profileSummaryLines.push(line);
              }
            }
            
            if (profileSummaryLines.length > 0) {
                healthProfileContext = "User Health Profile:\n" + profileSummaryLines.join('\n');
            } else {
                healthProfileContext = "User health profile is available but contains no filled details.";
            }

          } else {
            healthProfileContext = "User health profile not found.";
          }
        } catch (profileError) {
          console.error(`Error fetching health profile for user ${userId}:`, profileError);
          healthProfileContext = "Error fetching user health profile."; // Inform AI about the error
        }

        // Get all messages in this conversation for context
        const conversationMessages = await storage.getMessagesByConversationId(conversationId);
        
        // Convert to format expected by OpenAI
        const conversationHistory = conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        let responseMessage: any = null; 
        let responseSent = false; 

        try {
          console.log("Analyzing symptoms with context:", data.content, healthProfileContext);
          // Analyze symptoms using OpenAI, now passing health profile context
          const analysis = await analyzeSymptoms(data.content, conversationHistory, healthProfileContext); // Pass profile context
          console.log("Analysis received:", JSON.stringify(analysis, null, 2));

          // Determine the content for the assistant's message, ensuring it's a string
          let assistantContent: string;
          if (analysis && typeof analysis.message === 'string' && analysis.message.length > 0) {
              assistantContent = analysis.message;
          } else if (analysis && typeof (analysis as any).error === 'string') {
              // Handle the unexpected { "error": "..." } structure
              assistantContent = `Analysis failed: ${(analysis as any).error}`;
          } else {
              // Fallback if the structure is completely unexpected or message is empty
              assistantContent = "Sorry, an unexpected error occurred during analysis, or the response was empty.";
              console.error("Unexpected analysis result structure or empty message:", analysis);
          }

          // Save the AI's response as a message
          responseMessage = await storage.createMessage({
            conversationId,
            role: "assistant",
            content: assistantContent 
          });

          // Save the analysis results only if the analysis object has the expected structure
          if (analysis && typeof analysis.urgency === 'string' && Array.isArray(analysis.conditions) && Array.isArray(analysis.suggestions)) { 
            try {
              await storage.createAnalysis({
                conversationId,
                messageId: responseMessage.id,
                urgencyLevel: analysis.urgency,
                conditions: analysis.conditions, 
                suggestions: analysis.suggestions,
                specialty: analysis.specialty
              });
            } catch (analysisSaveError) {
              console.error("Error saving analysis details:", analysisSaveError);
              // Decide if you want to surface this error to the user or just log it
              // For now, just logging it, as the primary message was saved.
            }
          } else {
            console.warn("Analysis result structure missing expected fields, skipping analysis saving. Analysis:", analysis);
          }

        } catch (aiError: any) { 
            console.error("AI analysis or initial saving error:", aiError);
            if (!responseSent) { 
                 res.status(500).json({ message: `Failed to process message: ${aiError?.message || "Unknown error"}` });
                 responseSent = true; 
            }
        }

        // Send success response ONLY if no error response was sent
        if (!responseSent && responseMessage) {
             res.json(responseMessage);
             responseSent = true; 
        }
        // If responseMessage is null (e.g., error before it was created) and no error response sent, send generic error
        else if (!responseSent) {
             console.error("Failed to generate a response message and no specific error was caught.");
             res.status(500).json({ message: "Failed to generate a response." });
             responseSent = true;
        }

      }
      
      // If it was not a user message (e.g. initial system message?), just return the saved message
      else {
         res.json(message);
      }

    } catch (error: any) { 
      console.error("General message processing error:", error);
      // Ensure a response is sent even for non-AI errors
      if (!res.headersSent) {
          res.status(400).json({ message: `Bad request: ${error?.message || "Invalid input"}` });
      }
    }
  });

  // Get analyses for a conversation
  app.get("/api/conversations/:id/analyses", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const analyses = await storage.getAnalysesByConversationId(conversationId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Personalized Plan Route
  app.get('/api/personalized-plan', isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      console.log(`[GET] /api/personalized-plan called { userId: ${userId} }`);
      // Use the storage instance to get the profile
      const profile = await storage.getHealthProfile(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Health profile not found. Please create one first.' });
      }

      // Format profile context using the helper function
      const healthProfileContext = formatProfileForContext(profile);

      // Check if profile exists but yielded no context (all empty fields)
      if (!healthProfileContext) {
         console.warn(`[GET] /api/personalized-plan - Profile found but no data for context { userId: ${userId} }`);
         return res.status(400).json({ message: 'Health profile exists but contains no actionable data to generate a plan.' });
      }

      // Generate the plan using the new service function
      const plan: PersonalizedHealthPlan = await generatePersonalizedPlan(healthProfileContext);

      console.log(`[GET] /api/personalized-plan success { userId: ${userId} }`);
      res.json(plan);

    } catch (error) {
      console.error(`[GET] /api/personalized-plan error { userId: ${userId} }`, error);
      // Improved error handling to give more specific feedback
      if (error instanceof Error) {
         if (error.message.includes('OpenAI') || error.message.includes('generate personalized plan')) {
           // Check if it's a parsing error specifically
           if (error.message.includes('parse valid JSON')) {
              console.error("Invalid JSON structure received from OpenAI for plan.");
              return res.status(502).json({ message: 'AI service returned an invalid plan format. Please try again later.' });
           } else {
             return res.status(502).json({ message: 'Failed to generate plan due to an AI service error. Please try again later.' });
           }
         }
      }
      // Generic internal error
      res.status(500).json({ message: 'An internal error occurred while generating the health plan.' });
    }
  });

  // Detailed Nutrition Plan Route
  app.post('/api/nutrition-plan', isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      console.log(`[POST] /api/nutrition-plan called { userId: ${userId} }`);
      // Use the storage instance to get the profile
      const profile = await storage.getHealthProfile(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Health profile not found. Please create one first.' });
      }

      // Format profile context using the helper function
      const healthProfileContext = formatProfileForContext(profile);

      // Check if profile exists but yielded no context (all empty fields)
      if (!healthProfileContext) {
         console.warn(`[POST] /api/nutrition-plan - Profile found but no data for context { userId: ${userId} }`);
         return res.status(400).json({ message: 'Health profile exists but contains no actionable data to generate a plan.' });
      }

      // Generate the plan using the new service function
      const plan: DetailedNutritionPlan = await generateDetailedNutritionPlan(healthProfileContext);

      console.log(`[POST] /api/nutrition-plan success { userId: ${userId} }`);
      res.json(plan);

    } catch (error) {
      console.error(`[POST] /api/nutrition-plan error { userId: ${userId} }`, error);
      // Improved error handling to give more specific feedback
      if (error instanceof Error) {
         if (error.message.includes('OpenAI') || error.message.includes('generate detailed nutrition plan')) {
           // Check if it's a parsing error specifically
           if (error.message.includes('parse valid JSON')) {
              console.error("Invalid JSON structure received from OpenAI for plan.");
              return res.status(502).json({ message: 'AI service returned an invalid plan format. Please try again later.' });
           } else {
             return res.status(502).json({ message: 'Failed to generate plan due to an AI service error. Please try again later.' });
           }
         }
      }
      // Generic internal error
      res.status(500).json({ message: 'An internal error occurred while generating the nutrition plan.' });
    }
  });



  // Fitness data endpoint
  app.get('/api/fitness-data', isAuthenticated, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      console.log(`[GET] /api/fitness-data called { userId: ${userId} }`);
      const fitnessData = await getFitnessData(Number(userId));
      console.log(`[GET] /api/fitness-data success { userId: ${userId} }`);
      res.json(fitnessData);
    } catch (error) {
      console.error(`[GET] /api/fitness-data error { userId: ${userId} }`, error);
      if (error instanceof Error) {
        if (error.message === 'Google access token not found') {
          return res.status(401).json({ message: 'Please connect your Google Fit account' });
        } else if (error.message.includes('404')) {
          return res.status(400).json({ message: 'No fitness data available. Make sure you have granted all required permissions.' });
        } else if (error.message.includes('401') || error.message.includes('403')) {
          return res.status(401).json({ message: 'Access to fitness data denied. Please reconnect your Google Fit account.' });
        }
      }
      res.status(500).json({ message: 'Failed to fetch fitness data. Please try again later.' });
    }
  });

  // Catch-all middleware for unmatched requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("[CATCH-ALL] No route matched for", req.method, req.originalUrl);
    next();
  });

  return httpServer;
}
