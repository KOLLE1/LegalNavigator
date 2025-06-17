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

export const storage = new DatabaseStorage();
