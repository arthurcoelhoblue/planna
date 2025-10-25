import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  objective: mysqlEnum("objective", ["praticidade", "economia"]).default("praticidade"),
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