import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
// Import from the direct Gemini service
import { analyzeSymptoms } from "./services/gemini-direct";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { fetchHospitalsFromGoogle } from "./services/googleHospitals";

// Middleware to check if the user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log("[AUTH] isAuthenticated called", req.method, req.originalUrl);
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("[AUTH] Not authenticated");
  return res.status(401).json({ message: "Authentication required" });
}


export async function registerRoutes(app: Express): Promise<Server> {
  console.log("[ROUTES] registerRoutes called");
  // Setup authentication
  setupAuth(app);
  
  // Google OAuth routes
  app.get("/auth/google", passport.authenticate("google", { scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read'
  ] }));

  app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login", // Adjust to your frontend login route
    session: true
  }), (req, res) => {
    // On success, redirect to frontend app (adjust as needed)
    res.redirect("/");
  });

  // Logout route for browser-initiated logout
  app.get("/logout", (req, res, next) => {
    req.logout((err) => {
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

  // User routes - protected by authentication middleware
  app.get("/api/health-profile", isAuthenticated, async (req, res) => {
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
  
  app.patch("/api/health-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userId = req.user!.id;
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
  
  app.get("/api/health-metrics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const metrics = await storage.getHealthMetrics(userId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });
  
  app.post("/api/health-metrics", isAuthenticated, async (req, res) => {
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
  app.post("/api/autocorrect", async (req, res) => {
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
  app.patch("/api/conversations/:id/title", isAuthenticated, async (req, res) => {
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
  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      console.log("conversations", req.body);
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ message: `Invalid request: ${error?.message || "Unknown error"}` });
    }
  });

  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Get a conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
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
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Add a message to a conversation
  app.post("/api/conversations/:id/messages", async (req, res) => {
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
        // Get all messages in this conversation for context
        const conversationMessages = await storage.getMessagesByConversationId(conversationId);
        
        // Convert to format expected by OpenAI
        const conversationHistory = conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        try {
          console.log("Analyzing symptoms:", data.content);
          // Analyze symptoms using Gemini
          const analysis = await analyzeSymptoms(data.content, conversationHistory);
          console.log("Analysis received:", JSON.stringify(analysis, null, 2));
          
          // Save the AI's response as a message
          const responseMessage = await storage.createMessage({
            conversationId,
            role: "assistant",
            content: analysis.message
          });
          
          // Save the analysis results
          await storage.createAnalysis({
            conversationId,
            messageId: responseMessage.id,
            urgencyLevel: analysis.urgency,
            conditions: analysis.conditions,
            suggestions: analysis.suggestions
          });
          
          // Return both the message and analysis
          return res.json({
            message: responseMessage,
            analysis: {
              urgencyLevel: analysis.urgency,
              conditions: analysis.conditions,
              suggestions: analysis.suggestions,
              followUpQuestion: analysis.followUpQuestion
            }
          });
        } catch (aiError: any) {
          console.error("AI analysis error:", aiError);
          
          // Still return the user message but with an error
          return res.status(500).json({
            message,
            error: `Failed to analyze symptoms: ${aiError?.message || "Unknown error"}`
          });
        }
      }
      
      // For non-user messages, just return the message
      res.json({ message });
    } catch (error: any) {
      res.status(400).json({ message: `Invalid request: ${error?.message || "Unknown error"}` });
    }
  });

  // Get analyses for a conversation
  app.get("/api/conversations/:id/analyses", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const analyses = await storage.getAnalysesByConversationId(conversationId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: `Server error: ${error?.message || "Unknown error"}` });
    }
  });

  // Catch-all middleware for unmatched requests
  app.use((req, res, next) => {
    console.log("[CATCH-ALL] No route matched for", req.method, req.originalUrl);
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
