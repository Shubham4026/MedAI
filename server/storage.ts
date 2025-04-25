import { 
  users, type User, type InsertUser,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  analyses, type Analysis, type InsertAnalysis,
  healthProfiles, type HealthProfile, type InsertHealthProfile,
  healthMetrics, type HealthMetric, type InsertHealthMetric
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Health profile methods
  getHealthProfile(userId: number): Promise<HealthProfile | undefined>;
  createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile>;
  updateHealthProfile(userId: number, profile: Partial<InsertHealthProfile>): Promise<HealthProfile | undefined>;
  
  // Health metrics methods
  getHealthMetrics(userId: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Conversation methods
  updateConversationTitle(id: number, title: string): Promise<boolean>;
  getConversations(userId?: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message methods
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Analysis methods
  getAnalysesByConversationId(conversationId: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  // For backward compatibility with existing code
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getUserByEmail(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Health profile methods
  async getHealthProfile(userId: number): Promise<HealthProfile | undefined> {
    const [profile] = await db.select().from(healthProfiles).where(eq(healthProfiles.userId, userId));
    return profile;
  }
  
  async createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile> {
    const [createdProfile] = await db.insert(healthProfiles).values(profile).returning();
    return createdProfile;
  }
  
  async updateHealthProfile(
    userId: number,
    profileUpdate: Partial<Omit<InsertHealthProfile, 'id' | 'userId' | 'lastUpdated'>>
  ): Promise<HealthProfile> {
    // First check if a profile exists for this user
    const existingProfiles = await db
      .select()
      .from(healthProfiles)
      .where(eq(healthProfiles.userId, userId));
    
    if (existingProfiles.length > 0) {
      // If profile exists, update it
      const [updatedProfile] = await db
        .update(healthProfiles)
        .set({ ...profileUpdate, lastUpdated: new Date() })
        .where(eq(healthProfiles.userId, userId))
        .returning();
      
      return updatedProfile;
    } else {
      // If profile doesn't exist, create a new one
      // Remove id from profileUpdate to avoid primary key conflicts
      const { id, ...safeUpdate } = profileUpdate as any;
      
      const [createdProfile] = await db
        .insert(healthProfiles)
        .values({ ...safeUpdate, userId, lastUpdated: new Date() })
        .returning();
      
      return createdProfile;
    }
  }
  
  // Health metrics methods
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.date));
  }
  
  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [createdMetric] = await db.insert(healthMetrics).values(metric).returning();
    return createdMetric;
  }
  
  // Conversation methods
  async updateConversationTitle(id: number, title: string): Promise<boolean> {
    console.log("[UPDATE] /api/conversations/:id/title called", { id, title });
    const [updated] = await db
      .update(conversations)
      .set({ title })
      .where(eq(conversations.id, id))
      .returning();
    return !!updated;
  }

  async getConversations(userId?: number): Promise<Conversation[]> {
    let query = db.select().from(conversations);
    
    if (userId) {
      query = query.where(eq(conversations.userId, userId));
    }
    
    return await query.orderBy(desc(conversations.createdAt));
  }
  
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }
  
  // Message methods
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  // Analysis methods
  async getAnalysesByConversationId(conversationId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.conversationId, conversationId))
      .orderBy(desc(analyses.createdAt));
  }
  
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(insertAnalysis).returning();
    return analysis;
  }
}

export const storage = new DatabaseStorage();
