import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  emailVerified: boolean("emailVerified").default(false).notNull(), // Email verification status
  passwordHash: varchar("passwordHash", { length: 255 }), // For local auth (bcrypt hash)
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }), // Stripe Customer ID
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "premium"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User preferences for meal planning
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exclusions: text("exclusions"), // JSON array of excluded ingredients
  favorites: text("favorites"), // JSON array of favorite ingredients
  skillLevel: mysqlEnum("skillLevel", ["beginner", "intermediate", "advanced"]).default("intermediate"),
  dietType: varchar("dietType", { length: 100 }), // Nome da dieta escolhida
  dietProfile: text("dietProfile"), // JSON do perfil completo da dieta
  maxKcalPerServing: int("maxKcalPerServing"), // Limite de calorias por porção
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Planning sessions - each time a user generates a meal plan
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  inputText: text("inputText").notNull(), // Raw ingredient input from user
  servings: int("servings").notNull(), // Number of meals to plan
  objective: mysqlEnum("objective", ["normal", "aproveitamento"]).default("normal"),
  exclusions: text("exclusions"), // JSON array of excluded ingredients for this session
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Generated meal plans
 */
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  dishes: text("dishes").notNull(), // JSON array of dishes with ingredients and steps
  shoppingList: text("shoppingList").notNull(), // JSON array of shopping items by category
  prepSchedule: text("prepSchedule").notNull(), // JSON array of ordered prep steps
  exportUrl: varchar("exportUrl", { length: 512 }), // PDF export URL
  totalKcal: int("totalKcal"), // Total calories of the plan
  avgKcalPerServing: int("avgKcalPerServing"), // Average calories per serving
  dietType: varchar("dietType", { length: 128 }), // Diet type (e.g., "vegetariana", "vegana")
  mode: varchar("mode", { length: 64 }), // Mode: "normal" or "aproveitamento"
  skillLevel: varchar("skillLevel", { length: 64 }), // Skill level: "beginner", "intermediate", "advanced"
  availableTime: int("availableTime"), // Available time in hours
  estimatedTime: int("estimatedTime"), // Estimated time in hours
  allowNewIngredients: boolean("allowNewIngredients").default(true), // Whether to allow new ingredients
  maxKcalPerServing: int("maxKcalPerServing"), // Max calories per serving limit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * User feedback on dishes - for learning and personalization
 */
export const dishFeedback = mysqlTable("dish_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  dishName: varchar("dishName", { length: 256 }).notNull(),
  rating: mysqlEnum("rating", ["liked", "disliked"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DishFeedback = typeof dishFeedback.$inferSelect;
export type InsertDishFeedback = typeof dishFeedback.$inferInsert;

/**
 * Stripe subscriptions - minimal schema following Stripe best practices
 * Only stores IDs for API reference, fetches live data from Stripe API
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }), // Customer ID from Stripe
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(), // Subscription ID from Stripe
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(), // Price ID for this subscription
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd"), // Cache for quick access checks
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Email verification codes for 2FA during registration
 */
export const emailVerificationCodes = mysqlTable("email_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit code
  expiresAt: timestamp("expiresAt").notNull(), // Expiration time (e.g., 15 minutes)
  verified: boolean("verified").default(false).notNull(), // Whether code was used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

/**
 * Password reset tokens for local authentication
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: mysqlEnum("used", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;