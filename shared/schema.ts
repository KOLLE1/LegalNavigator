import { mysqlTable, text, int, boolean, timestamp, varchar, json, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  isLawyer: boolean("is_lawyer").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorMethod: varchar("two_factor_method", { length: 20 }), // 'email' or 'totp'
  twoFactorSecret: text("two_factor_secret"), // TOTP secret
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  lastActive: timestamp("last_active"),
});

// Chat sessions table
export const chatSessions = mysqlTable("chat_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, archived, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Chat messages table
export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: varchar("session_id", { length: 36 }).notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sender: varchar("sender", { length: 10 }).notNull(), // 'user' or 'ai'
  metadata: json("metadata"), // for storing AI response metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// Lawyers table
export const lawyers = mysqlTable("lawyers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  experienceYears: int("experience_years").notNull(),
  practiceAreas: json("practice_areas").notNull(), // Array stored as JSON
  languages: json("languages").notNull(), // Array stored as JSON
  officeAddress: text("office_address"),
  description: text("description"),
  hourlyRate: int("hourly_rate"), // Store as cents
  verified: boolean("verified").default(false),
  rating: int("rating").default(0), // Store as integer (e.g. 450 = 4.5 rating)
  totalReviews: int("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Lawyer ratings table
export const lawyerRatings = mysqlTable("lawyer_ratings", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  lawyerId: varchar("lawyer_id", { length: 36 }).notNull().references(() => lawyers.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(), // 1-5 scale
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification codes table
export const verificationCodes = mysqlTable("verification_codes", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(), // 'email_verification', '2fa_email', 'password_reset'
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'info', 'warning', 'success', 'error'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table for express session storage
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).notNull().primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("expire_idx").on(table.expire),
  })
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  chatSessions: many(chatSessions),
  chatMessages: many(chatMessages),
  lawyer: one(lawyers, { fields: [users.id], references: [lawyers.userId] }),
  lawyerRatings: many(lawyerRatings),
  verificationCodes: many(verificationCodes),
  notifications: many(notifications),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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