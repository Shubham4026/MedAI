import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with expanded profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // Google OAuth tokens
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  healthProfiles: many(healthProfiles),
  conversations: many(conversations),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  googleAccessToken: true,
  googleRefreshToken: true,
  googleTokenExpiry: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Health profile for storing user health information
// export const healthProfiles = pgTable("health_profiles", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   age: integer("age"),
//   gender: text("gender"),
//   height: real("height"), // in cm
//   weight: real("weight"), // in kg
//   bloodType: text("blood_type"),
//   allergies: jsonb("allergies").default([]),
//   chronicConditions: jsonb("chronic_conditions").default([]),
//   medications: jsonb("medications").default([]),
//   familyHistory: jsonb("family_history").default([]),
//   lifestyleHabits: jsonb("lifestyle_habits").default({}),
//   lastUpdated: timestamp("last_updated").notNull().defaultNow(),
// });

export const healthProfiles = pgTable("health_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),

  // Basic Info
  age: integer("age"),
  gender: text("gender"),
  height: real("height"), // in meters
  weight: real("weight"), // in kg
  bloodType: text("blood_type"),

  // Medical History
  allergies: jsonb("allergies").default([]),
  chronicConditions: jsonb("chronic_conditions").default([]),
  medications: jsonb("medications").default([]),
  familyHistory: jsonb("family_history").default([]),

  // Lifestyle & Diet
  lifestyleHabits: jsonb("lifestyle_habits").default({}),
  dietType: text("diet_type"),
  dailyCaloricIntake: integer("daily_caloric_intake"),
  waterIntakeLiters: real("water_intake_liters"),
  activityLevel: text("activity_level"),
  exerciseFrequency: text("exercise_frequency"),
  stepCountAvgDaily: integer("step_count_avg_daily"),

  // Mental Health & Sleep
  stressLevel: integer("stress_level"),
  sleepQuality: text("sleep_quality"),
  hoursOfSleep: real("hours_of_sleep"),
  mentalHealthIssues: jsonb("mental_health_issues").default([]),

  // Vitals & Biometrics
  bloodPressure: text("blood_pressure"),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  bodyTemperature: real("body_temperature"),
  bloodSugarLevel: real("blood_sugar_level"),
  cholesterolLevel: real("cholesterol_level"),
  nutritionalDeficiencies: jsonb("nutritional_deficiencies").default([]),

  // Environmental & Social
  recentLabResults: jsonb("recent_lab_results").default({}),
  vaccinationHistory: jsonb("vaccination_history").default([]),
  screeningsDone: jsonb("screenings_done").default([]),
  occupationType: text("occupation_type"),
  exposureToPollution: text("exposure_to_pollution"),
  socialConnections: text("social_connections"),

  // Derived / Calculated
  bmi: real("bmi"),
  bmiCategory: text("bmi_category"),
  healthScore: real("health_score"),
  riskFlags: jsonb("risk_flags").default([]),

  // Audit
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const healthProfilesRelations = relations(healthProfiles, ({ one }) => ({
  user: one(users, {
    fields: [healthProfiles.userId],
    references: [users.id],
  }),
}));

export const insertHealthProfileSchema = createInsertSchema(healthProfiles).pick({
  userId: true,
  age: true,
  gender: true,
  height: true,
  weight: true,
  bloodType: true,
  allergies: true,
  chronicConditions: true,
  medications: true,
  familyHistory: true,
  lifestyleHabits: true,
  dietType: true,
  dailyCaloricIntake: true,
  waterIntakeLiters: true,
  activityLevel: true,
  exerciseFrequency: true,
  stepCountAvgDaily: true,
  stressLevel: true,
  sleepQuality: true,
  hoursOfSleep: true,
  mentalHealthIssues: true,
  bloodPressure: true,
  heartRate: true,
  respiratoryRate: true,
  bodyTemperature: true,
  bloodSugarLevel: true,
  cholesterolLevel: true,
  nutritionalDeficiencies: true,
  recentLabResults: true,
  vaccinationHistory: true,
  screeningsDone: true,
  occupationType: true,
  exposureToPollution: true,
  socialConnections: true,
  bmi: true,
  bmiCategory: true,
  healthScore: true,
  riskFlags: true,
  lastUpdated: true,
});

export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type HealthProfile = typeof healthProfiles.$inferSelect;

// Define the structure for the personalized health plan
export interface PersonalizedHealthPlan {
  overallSummary: string; // Brief overview and goals
  keyMetricsFocus: string[]; // e.g., ["BMI", "Blood Pressure", "Cholesterol"]
  riskHighlights: Array<{ risk: string; explanation: string; severity: 'Low' | 'Moderate' | 'High' }>; // Identified risks from profile
  dietRecommendations: Array<{ recommendation: string; reasoning: string }>;
  exerciseRecommendations: Array<{ recommendation: string; reasoning: string }>;
  preventiveCare: Array<{ suggestion: string; frequency?: string; reasoning: string }>; // e.g., Screenings, check-ups
  mentalWellness: Array<{ suggestion: string; reasoning: string }>;
  disclaimer: string; // Standard medical disclaimer
}

/**
 * Represents the complete health profile stored in the database.
 *
 */

// Conversations table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  analyses: many(analyses),
}));

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  title: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  analyses: many(analyses),
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Analyses table
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  messageId: integer("message_id").notNull(),
  urgencyLevel: text("urgency_level").notNull(), // 'mild', 'moderate', 'severe'
  conditions: json("conditions").notNull(),
  suggestions: json("suggestions").notNull(),
  specialty: text("specialty"), // 'pediatric', 'heart', 'ortho', 'general'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const analysesRelations = relations(analyses, ({ one }) => ({
  conversation: one(conversations, {
    fields: [analyses.conversationId],
    references: [conversations.id],
  }),
  message: one(messages, {
    fields: [analyses.messageId],
    references: [messages.id],
  }),
}));

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  conversationId: true,
  messageId: true,
  urgencyLevel: true,
  conditions: true,
  suggestions: true,
  specialty: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// Health metrics for tracking over time
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  weight: real("weight"),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  temperature: real("temperature"),
  glucoseLevel: real("glucose_level"),
  sleepHours: real("sleep_hours"),
  stepsCount: integer("steps_count"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).pick({
  userId: true,
  date: true,
  weight: true,
  bloodPressureSystolic: true,
  bloodPressureDiastolic: true,
  heartRate: true,
  temperature: true,
  glucoseLevel: true,
  sleepHours: true,
  stepsCount: true,
  notes: true,
});

export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;

export interface DetailedNutritionPlan {
  overallGoal: string; // e.g., Weight loss, muscle gain, general health
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
  generalAdvice: string[]; // Other tips like meal timing, supplements etc.
  disclaimer: string;
}
