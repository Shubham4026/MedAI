export type UrgencyLevel = "mild" | "moderate" | "severe";

export interface Condition {
  name: string;
  likelihood: "High" | "Moderate" | "Low";
}

export interface Suggestion {
  text: string;
  isWarning: boolean;
}

export interface Analysis {
  urgencyLevel: UrgencyLevel;
  conditions: Condition[];
  suggestions: Suggestion[];
  followUpQuestion?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  analysis?: Analysis;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  message?: string;
  success: boolean;
  data?: T;
}
