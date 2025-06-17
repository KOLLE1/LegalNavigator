import { eq, and, desc, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { initializeDatabase } from './db-mysql.js';
import {
  users, chatSessions, chatMessages, lawyers, lawyerRatings,
  verificationCodes, notifications,
  User, InsertUser, ChatSession, InsertChatSession,
  ChatMessage, InsertChatMessage, Lawyer, InsertLawyer,
  LawyerRating, InsertLawyerRating, VerificationCode, InsertVerificationCode,
  Notification, InsertNotification
} from '../shared/schema.js';
import { IStorage } from './storage.js';

export class MySQLStorage implements IStorage {
  private db: any = null;

  private async getDB() {
    if (!this.db) {
      this.db = await initializeDatabase();
    }
    return this.db;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDB();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.getDB();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const db = await this.getDB();
    const newUser = {
      id: nanoid(),
      ...user,
    };
    
    await db.insert(users).values(newUser);
    return newUser as User;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const db = await this.getDB();
    await db.update(users).set(user).where(eq(users.id, id));
    const updated = await this.getUser(id);
    if (!updated) throw new Error('User not found');
    return updated;
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const db = await this.getDB();
    const newSession = {
      id: nanoid(),
      ...session,
    };
    
    await db.insert(chatSessions).values(newSession);
    return newSession as ChatSession;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    const db = await this.getDB();
    return await db.select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const db = await this.getDB();
    const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
    return result[0];
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession> {
    const db = await this.getDB();
    await db.update(chatSessions).set(session).where(eq(chatSessions.id, id));
    const updated = await this.getChatSession(id);
    if (!updated) throw new Error('Chat session not found');
    return updated;
  }

  // Message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const db = await this.getDB();
    const newMessage = {
      id: nanoid(),
      ...message,
    };
    
    await db.insert(chatMessages).values(newMessage);
    return newMessage as ChatMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = await this.getDB();
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // Lawyer operations
  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const db = await this.getDB();
    const newLawyer = {
      id: nanoid(),
      ...lawyer,
    };
    
    await db.insert(lawyers).values(newLawyer);
    return newLawyer as Lawyer;
  }

  async getLawyers(filters?: {
    specialization?: string;
    location?: string;
    language?: string;
    minRating?: number;
  }): Promise<(Lawyer & { user: User })[]> {
    const db = await this.getDB();
    const results = await db.select({
      id: lawyers.id,
      userId: lawyers.userId,
      licenseNumber: lawyers.licenseNumber,
      specialization: lawyers.specialization,
      experienceYears: lawyers.experienceYears,
      location: lawyers.location,
      languages: lawyers.languages,
      hourlyRate: lawyers.hourlyRate,
      bio: lawyers.bio,
      education: lawyers.education,
      certifications: lawyers.certifications,
      availabilitySchedule: lawyers.availabilitySchedule,
      isVerified: lawyers.isVerified,
      rating: lawyers.rating,
      totalRatings: lawyers.totalRatings,
      createdAt: lawyers.createdAt,
      updatedAt: lawyers.updatedAt,
      user: {
        id: users.id,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        emailVerified: users.emailVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorSecret: users.twoFactorSecret,
        backupCodes: users.backupCodes,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }
    })
    .from(lawyers)
    .leftJoin(users, eq(lawyers.userId, users.id));

    return results.filter((row: any) => row.user).map((row: any) => ({
      ...row,
      user: row.user
    })) as (Lawyer & { user: User })[];
  }

  async getLawyer(id: string): Promise<(Lawyer & { user: User }) | undefined> {
    const db = await this.getDB();
    const result = await db.select({
      id: lawyers.id,
      userId: lawyers.userId,
      licenseNumber: lawyers.licenseNumber,
      specialization: lawyers.specialization,
      experienceYears: lawyers.experienceYears,
      location: lawyers.location,
      languages: lawyers.languages,
      hourlyRate: lawyers.hourlyRate,
      bio: lawyers.bio,
      education: lawyers.education,
      certifications: lawyers.certifications,
      availabilitySchedule: lawyers.availabilitySchedule,
      isVerified: lawyers.isVerified,
      rating: lawyers.rating,
      totalRatings: lawyers.totalRatings,
      createdAt: lawyers.createdAt,
      updatedAt: lawyers.updatedAt,
      user: {
        id: users.id,
        email: users.email,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        emailVerified: users.emailVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorSecret: users.twoFactorSecret,
        backupCodes: users.backupCodes,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }
    })
    .from(lawyers)
    .leftJoin(users, eq(lawyers.userId, users.id))
    .where(eq(lawyers.id, id))
    .limit(1);

    if (result.length === 0 || !result[0].user) return undefined;
    
    return {
      ...result[0],
      user: result[0].user
    } as Lawyer & { user: User };
  }

  async updateLawyer(id: string, lawyer: Partial<InsertLawyer>): Promise<Lawyer> {
    const db = await this.getDB();
    await db.update(lawyers).set(lawyer).where(eq(lawyers.id, id));
    const updated = await db.select().from(lawyers).where(eq(lawyers.id, id)).limit(1);
    if (!updated[0]) throw new Error('Lawyer not found');
    return updated[0];
  }

  // Rating operations
  async createLawyerRating(rating: InsertLawyerRating): Promise<LawyerRating> {
    const db = await this.getDB();
    const newRating = {
      id: nanoid(),
      ...rating,
    };
    
    await db.insert(lawyerRatings).values(newRating);
    return newRating as LawyerRating;
  }

  async getLawyerRatings(lawyerId: string): Promise<LawyerRating[]> {
    const db = await this.getDB();
    return await db.select()
      .from(lawyerRatings)
      .where(eq(lawyerRatings.lawyerId, lawyerId))
      .orderBy(desc(lawyerRatings.createdAt));
  }

  // Verification operations
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const db = await this.getDB();
    const newCode = {
      id: nanoid(),
      ...code,
    };
    
    await db.insert(verificationCodes).values(newCode);
    return newCode as VerificationCode;
  }

  async getVerificationCode(userId: string, type: string, code: string): Promise<VerificationCode | undefined> {
    const db = await this.getDB();
    const result = await db.select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.type, type as any),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, false),
          gte(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);
    
    return result[0];
  }

  async markVerificationCodeUsed(id: string): Promise<void> {
    const db = await this.getDB();
    await db.update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const db = await this.getDB();
    const newNotification = {
      id: nanoid(),
      ...notification,
    };
    
    await db.insert(notifications).values(newNotification);
    return newNotification as Notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const db = await this.getDB();
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    const db = await this.getDB();
    await db.update(notifications)
      .set({ readStatus: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new MySQLStorage();