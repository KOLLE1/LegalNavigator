import {
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
import { nanoid } from "nanoid";

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
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: nanoid(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || null,
      role: user.role || null,
      isLawyer: user.isLawyer || null,
      emailVerified: user.emailVerified || null,
      twoFactorEnabled: user.twoFactorEnabled || null,
      twoFactorMethod: user.twoFactorMethod || null,
      twoFactorSecret: user.twoFactorSecret || null,
      backupCodes: user.backupCodes || null,
      location: user.location || null,
      profileImageUrl: user.profileImageUrl || null,
      lastActive: user.lastActive || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updated: User = {
      ...existingUser,
      ...user,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const newSession: ChatSession = {
      id: nanoid(),
      userId: session.userId,
      title: session.title,
      status: session.status || null,
      language: session.language || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(newSession.id, newSession);
    return newSession;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession> {
    const existingSession = this.chatSessions.get(id);
    if (!existingSession) {
      throw new Error("Chat session not found");
    }
    const updated: ChatSession = {
      ...existingSession,
      ...session,
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, updated);
    return updated;
  }

  // Message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: nanoid(),
      role: message.role,
      sessionId: message.sessionId,
      content: message.content,
      category: message.category || null,
      confidence: message.confidence || null,
      referencesData: message.referencesData || null,
      createdAt: new Date(),
    };
    this.chatMessages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Lawyer operations
  async createLawyer(lawyer: InsertLawyer): Promise<Lawyer> {
    const newLawyer: Lawyer = {
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...lawyer,
    };
    this.lawyers.set(newLawyer.id, newLawyer);
    return newLawyer;
  }

  async getLawyers(filters?: {
    specialization?: string;
    location?: string;
    language?: string;
    minRating?: number;
  }): Promise<(Lawyer & { user: User })[]> {
    let lawyers = Array.from(this.lawyers.values());

    if (filters) {
      if (filters.specialization) {
        lawyers = lawyers.filter(lawyer => 
          lawyer.specialization.toLowerCase().includes(filters.specialization!.toLowerCase())
        );
      }
      if (filters.minRating) {
        lawyers = lawyers.filter(lawyer => lawyer.rating >= filters.minRating!);
      }
      if (filters.language) {
        lawyers = lawyers.filter(lawyer => 
          lawyer.languages.some(lang => lang.toLowerCase().includes(filters.language!.toLowerCase()))
        );
      }
    }

    const results: (Lawyer & { user: User })[] = [];
    for (const lawyer of lawyers) {
      const user = this.users.get(lawyer.userId);
      if (user) {
        if (filters?.location) {
          if (user.location?.toLowerCase().includes(filters.location.toLowerCase())) {
            results.push({ ...lawyer, user });
          }
        } else {
          results.push({ ...lawyer, user });
        }
      }
    }

    return results.sort((a, b) => b.rating - a.rating);
  }

  async getLawyer(id: string): Promise<(Lawyer & { user: User }) | undefined> {
    const lawyer = this.lawyers.get(id);
    if (!lawyer) return undefined;
    
    const user = this.users.get(lawyer.userId);
    if (!user) return undefined;
    
    return { ...lawyer, user };
  }

  async updateLawyer(id: string, lawyer: Partial<InsertLawyer>): Promise<Lawyer> {
    const existingLawyer = this.lawyers.get(id);
    if (!existingLawyer) {
      throw new Error("Lawyer not found");
    }
    const updated: Lawyer = {
      ...existingLawyer,
      ...lawyer,
      updatedAt: new Date(),
    };
    this.lawyers.set(id, updated);
    return updated;
  }

  // Rating operations
  async createLawyerRating(rating: InsertLawyerRating): Promise<LawyerRating> {
    const newRating: LawyerRating = {
      id: nanoid(),
      createdAt: new Date(),
      ...rating,
    };
    this.lawyerRatings.set(newRating.id, newRating);
    return newRating;
  }

  async getLawyerRatings(lawyerId: string): Promise<LawyerRating[]> {
    return Array.from(this.lawyerRatings.values())
      .filter(rating => rating.lawyerId === lawyerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Verification operations
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const newCode: VerificationCode = {
      id: nanoid(),
      createdAt: new Date(),
      ...code,
    };
    this.verificationCodes.set(newCode.id, newCode);
    return newCode;
  }

  async getVerificationCode(userId: string, type: string, code: string): Promise<VerificationCode | undefined> {
    for (const verificationCode of Array.from(this.verificationCodes.values())) {
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
    const newNotification: Notification = {
      id: nanoid(),
      createdAt: new Date(),
      ...notification,
    };
    this.notifications.set(newNotification.id, newNotification);
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

// Check if running in Replit environment
const isReplit = process.env.REPLIT_DEPLOYMENT_ID || process.env.REPL_ID;

// Storage initialization function
export async function initializeStorage(): Promise<IStorage> {
  return new MemStorage();
}

// For now, use in-memory storage to ensure the app works
export const storage = new MemStorage();