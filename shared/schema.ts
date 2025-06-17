import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isLawyer: boolean("is_lawyer").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorMethod: text("two_factor_method"),
  twoFactorSecret: text("two_factor_secret"),
  phone: text("phone"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActive: timestamp("last_active"),
});

// Chat sessions table
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").default("active"), // active, archived, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  metadata: jsonb("metadata"), // for storing AI response metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// Lawyers table
export const lawyers = pgTable("lawyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  licenseNumber: text("license_number").notNull().unique(),
  specialization: text("specialization").notNull(),
  experienceYears: integer("experience_years").notNull(),
  practiceAreas: text("practice_areas").array(),
  languages: text("languages").array(),
  officeAddress: text("office_address"),
  description: text("description"),
  hourlyRate: integer("hourly_rate"),
  verified: boolean("verified").default(false),
  rating: integer("rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lawyer ratings table
export const lawyerRatings = pgTable("lawyer_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawyerId: uuid("lawyer_id").notNull().references(() => lawyers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification codes table (for 2FA and email verification)
export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: text("type").notNull(), // 'email_verification', 'two_factor', 'password_reset'
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'success', 'error'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  chatSessions: many(chatSessions),
  chatMessages: many(chatMessages),
  lawyer: one(lawyers, { fields: [users.id], references: [lawyers.userId] }),
  lawyerRatings: many(lawyerRatings),
  notifications: many(notifications),
  verificationCodes: many(verificationCodes),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, { fields: [chatMessages.sessionId], references: [chatSessions.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const lawyersRelations = relations(lawyers, ({ one, many }) => ({
  user: one(users, { fields: [lawyers.userId], references: [users.id] }),
  ratings: many(lawyerRatings),
}));

export const lawyerRatingsRelations = relations(lawyerRatings, ({ one }) => ({
  lawyer: one(lawyers, { fields: [lawyerRatings.lawyerId], references: [lawyers.id] }),
  user: one(users, { fields: [lawyerRatings.userId], references: [users.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActive: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLawyerSchema = createInsertSchema(lawyers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalReviews: true,
});

export const insertLawyerRatingSchema = createInsertSchema(lawyerRatings).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Lawyer = typeof lawyers.$inferSelect;
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;
export type LawyerRating = typeof lawyerRatings.$inferSelect;
export type InsertLawyerRating = z.infer<typeof insertLawyerRatingSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
