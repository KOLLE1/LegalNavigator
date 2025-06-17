import { z } from "zod";
import { nanoid } from "nanoid";

// Type definitions for the legal assistance application
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isLawyer: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod?: string; // 'email' or 'totp'
  twoFactorSecret?: string; // TOTP secret
  phone?: string;
  location?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  status: string; // active, archived, deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  sender: string; // 'user' or 'ai'
  metadata?: any; // for storing AI response metadata
  createdAt: Date;
}

export interface Lawyer {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  experienceYears: number;
  practiceAreas: string[]; // Array of practice areas
  languages: string[]; // Array of languages
  officeAddress?: string;
  description?: string;
  hourlyRate?: number; // Store as cents
  verified: boolean;
  rating: number; // Store as integer (e.g. 450 = 4.5 rating)
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawyerRating {
  id: string;
  lawyerId: string;
  userId: string;
  rating: number; // 1-5 scale
  review?: string;
  createdAt: Date;
}

export interface VerificationCode {
  id: string;
  userId: string;
  code: string;
  type: string; // 'email_verification', '2fa_email', 'password_reset'
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string; // 'info', 'warning', 'success', 'error'
  read: boolean;
  createdAt: Date;
}

// Insert schemas using Zod
export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  passwordHash: z.string(),
  isLawyer: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorMethod: z.string().optional(),
  twoFactorSecret: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  profileImageUrl: z.string().optional(),
  emailVerified: z.boolean().default(false),
  lastActive: z.date().optional(),
});

export const insertChatSessionSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  status: z.string().default("active"),
});

export const insertChatMessageSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  content: z.string().min(1),
  sender: z.enum(["user", "ai"]),
  metadata: z.any().optional(),
});

export const insertLawyerSchema = z.object({
  userId: z.string(),
  licenseNumber: z.string(),
  specialization: z.string(),
  experienceYears: z.number().min(0),
  practiceAreas: z.array(z.string()),
  languages: z.array(z.string()),
  officeAddress: z.string().optional(),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
  verified: z.boolean().default(false),
  rating: z.number().default(0),
  totalReviews: z.number().default(0),
});

export const insertLawyerRatingSchema = z.object({
  lawyerId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

export const insertVerificationCodeSchema = z.object({
  userId: z.string(),
  code: z.string(),
  type: z.string(),
  used: z.boolean().default(false),
  expiresAt: z.date(),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(["info", "warning", "success", "error"]),
  read: z.boolean().default(false),
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;
export type InsertLawyerRating = z.infer<typeof insertLawyerRatingSchema>;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;