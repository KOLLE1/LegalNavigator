import {
  users,
  chatSessions,
  chatMessages,
  lawyers,
  lawyerRatings,
  verificationCodes,
  notifications,
  type User,
  type InsertUser,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type Lawyer,
  type InsertLawyer,
  type LawyerRating,
  type InsertLawyerRating,
  type VerificationCode,
  type InsertVerificationCode,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession>;
  
  // Message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Lawyer operations
  createLawyer(lawyer: InsertLawyer): Promise<Lawyer>;
  getLawyers(filters?: {
    specialization?: string;
    location?: string;
    language?: string;
    minRating?: number;
  }): Promise<(Lawyer & { user: User })[]>;
  getLawyer(id: string): Promise<(Lawyer & { user: User }) | undefined>;
  updateLawyer(id: string, lawyer: Partial<InsertLawyer>): Promise<Lawyer>;
  
  // Rating operations
  createLawyerRating(rating: InsertLawyerRating): Promise<LawyerRating>;
  getLawyerRatings(lawyerId: string): Promise<LawyerRating[]>;
  
  // Verification operations
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(userId: string, type: string, code: string): Promise<VerificationCode | undefined>;
  markVerificationCodeUsed(id: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        updatedAt: new Date(),
      })
      .returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...user,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values({
        ...session,
        updatedAt: new Date(),
      })
      .returning();
    return newSession;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({
        ...session,
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // Lawyer operations
  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const [newLawyer] = await db
      .insert(lawyers)
      .values({
        ...lawyer,
        updatedAt: new Date(),
      })
      .returning();
    return newLawyer;
  }

  async getLawyers(filters?: {
    specialization?: string;
    location?: string;
    language?: string;
    minRating?: number;
  }): Promise<(Lawyer & { user: User })[]> {
    let query = db
      .select({
        id: lawyers.id,
        userId: lawyers.userId,
        licenseNumber: lawyers.licenseNumber,
        specialization: lawyers.specialization,
        experienceYears: lawyers.experienceYears,
        practiceAreas: lawyers.practiceAreas,
        languages: lawyers.languages,
        officeAddress: lawyers.officeAddress,
        description: lawyers.description,
        hourlyRate: lawyers.hourlyRate,
        verified: lawyers.verified,
        rating: lawyers.rating,
        totalReviews: lawyers.totalReviews,
        createdAt: lawyers.createdAt,
        updatedAt: lawyers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          passwordHash: users.passwordHash,
          isLawyer: users.isLawyer,
          twoFactorEnabled: users.twoFactorEnabled,
          twoFactorMethod: users.twoFactorMethod,
          twoFactorSecret: users.twoFactorSecret,
          phone: users.phone,
          location: users.location,
          profileImageUrl: users.profileImageUrl,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastActive: users.lastActive,
        }
      })
      .from(lawyers)
      .innerJoin(users, eq(lawyers.userId, users.id))
      .where(eq(lawyers.verified, true));

    if (filters) {
      const conditions = [];
      
      if (filters.specialization) {
        conditions.push(ilike(lawyers.specialization, `%${filters.specialization}%`));
      }
      
      if (filters.location) {
        conditions.push(ilike(users.location, `%${filters.location}%`));
      }
      
      if (filters.minRating) {
        conditions.push(gt(lawyers.rating, filters.minRating));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return await query.orderBy(desc(lawyers.rating));
  }

  async getLawyer(id: string): Promise<(Lawyer & { user: User }) | undefined> {
    const [lawyer] = await db
      .select({
        id: lawyers.id,
        userId: lawyers.userId,
        licenseNumber: lawyers.licenseNumber,
        specialization: lawyers.specialization,
        experienceYears: lawyers.experienceYears,
        practiceAreas: lawyers.practiceAreas,
        languages: lawyers.languages,
        officeAddress: lawyers.officeAddress,
        description: lawyers.description,
        hourlyRate: lawyers.hourlyRate,
        verified: lawyers.verified,
        rating: lawyers.rating,
        totalReviews: lawyers.totalReviews,
        createdAt: lawyers.createdAt,
        updatedAt: lawyers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          passwordHash: users.passwordHash,
          isLawyer: users.isLawyer,
          twoFactorEnabled: users.twoFactorEnabled,
          twoFactorMethod: users.twoFactorMethod,
          twoFactorSecret: users.twoFactorSecret,
          phone: users.phone,
          location: users.location,
          profileImageUrl: users.profileImageUrl,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastActive: users.lastActive,
        }
      })
      .from(lawyers)
      .innerJoin(users, eq(lawyers.userId, users.id))
      .where(eq(lawyers.id, id));
    
    return lawyer || undefined;
  }

  async updateLawyer(id: string, lawyer: Partial<InsertLawyer>): Promise<Lawyer> {
    const [updatedLawyer] = await db
      .update(lawyers)
      .set({
        ...lawyer,
        updatedAt: new Date(),
      })
      .where(eq(lawyers.id, id))
      .returning();
    return updatedLawyer;
  }

  // Rating operations
  async createLawyerRating(rating: InsertLawyerRating): Promise<LawyerRating> {
    const [newRating] = await db
      .insert(lawyerRatings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getLawyerRatings(lawyerId: string): Promise<LawyerRating[]> {
    return await db
      .select()
      .from(lawyerRatings)
      .where(eq(lawyerRatings.lawyerId, lawyerId))
      .orderBy(desc(lawyerRatings.createdAt));
  }

  // Verification operations
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const [newCode] = await db
      .insert(verificationCodes)
      .values(code)
      .returning();
    return newCode;
  }

  async getVerificationCode(userId: string, type: string, code: string): Promise<VerificationCode | undefined> {
    const [verificationCode] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.type, type),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, false),
          gt(verificationCodes.expiresAt, new Date())
        )
      );
    return verificationCode || undefined;
  }

  async markVerificationCodeUsed(id: string): Promise<void> {
    await db
      .update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

// In-memory storage implementation for Replit environment
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private lawyers: Map<string, Lawyer> = new Map();
  private lawyerRatings: Map<string, LawyerRating> = new Map();
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private notifications: Map<string, Notification> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: null,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error('User not found');
    
    const updated: User = {
      ...existing,
      ...user,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = crypto.randomUUID();
    const newSession: ChatSession = {
      id,
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, newSession);
    return newSession;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession> {
    const existing = this.chatSessions.get(id);
    if (!existing) throw new Error('Chat session not found');
    
    const updated: ChatSession = {
      ...existing,
      ...session,
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, updated);
    return updated;
  }

  // Message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = crypto.randomUUID();
    const newMessage: ChatMessage = {
      id,
      ...message,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Lawyer operations
  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const id = crypto.randomUUID();
    const newLawyer: Lawyer = {
      id,
      ...lawyer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lawyers.set(id, newLawyer);
    return newLawyer;
  }

  async getLawyers(filters?: {
    specialization?: string;
    location?: string;
    language?: string;
    minRating?: number;
  }): Promise<(Lawyer & { user: User })[]> {
    let lawyers = Array.from(this.lawyers.values()).filter(lawyer => lawyer.verified);
    
    if (filters) {
      if (filters.specialization) {
        lawyers = lawyers.filter(lawyer => 
          lawyer.specialization.toLowerCase().includes(filters.specialization!.toLowerCase())
        );
      }
      if (filters.minRating) {
        lawyers = lawyers.filter(lawyer => lawyer.rating >= filters.minRating!);
      }
    }

    const result = [];
    for (const lawyer of lawyers) {
      const user = this.users.get(lawyer.userId);
      if (user) {
        if (filters?.location && !user.location?.toLowerCase().includes(filters.location.toLowerCase())) {
          continue;
        }
        if (filters?.language && !lawyer.languages.some(lang => 
          lang.toLowerCase().includes(filters.language!.toLowerCase())
        )) {
          continue;
        }
        result.push({ ...lawyer, user });
      }
    }

    return result.sort((a, b) => b.rating - a.rating);
  }

  async getLawyer(id: string): Promise<(Lawyer & { user: User }) | undefined> {
    const lawyer = this.lawyers.get(id);
    if (!lawyer) return undefined;
    
    const user = this.users.get(lawyer.userId);
    if (!user) return undefined;
    
    return { ...lawyer, user };
  }

  async updateLawyer(id: string, lawyer: Partial<InsertLawyer>): Promise<Lawyer> {
    const existing = this.lawyers.get(id);
    if (!existing) throw new Error('Lawyer not found');
    
    const updated: Lawyer = {
      ...existing,
      ...lawyer,
      updatedAt: new Date(),
    };
    this.lawyers.set(id, updated);
    return updated;
  }

  // Rating operations
  async createLawyerRating(rating: InsertLawyerRating): Promise<LawyerRating> {
    const id = crypto.randomUUID();
    const newRating: LawyerRating = {
      id,
      ...rating,
      createdAt: new Date(),
    };
    this.lawyerRatings.set(id, newRating);
    return newRating;
  }

  async getLawyerRatings(lawyerId: string): Promise<LawyerRating[]> {
    return Array.from(this.lawyerRatings.values())
      .filter(rating => rating.lawyerId === lawyerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Verification operations
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const id = crypto.randomUUID();
    const newCode: VerificationCode = {
      id,
      ...code,
      createdAt: new Date(),
    };
    this.verificationCodes.set(id, newCode);
    return newCode;
  }

  async getVerificationCode(userId: string, type: string, code: string): Promise<VerificationCode | undefined> {
    for (const verificationCode of this.verificationCodes.values()) {
      if (
        verificationCode.userId === userId &&
        verificationCode.type === type &&
        verificationCode.code === code &&
        !verificationCode.used &&
        verificationCode.expiresAt > new Date()
      ) {
        return verificationCode;
      }
    }
    return undefined;
  }

  async markVerificationCodeUsed(id: string): Promise<void> {
    const code = this.verificationCodes.get(id);
    if (code) {
      this.verificationCodes.set(id, { ...code, used: true });
    }
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, read: true });
    }
  }
}

export const storage = new MemStorage();
