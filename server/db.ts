import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Planna - Meal Planning Queries

import { dishFeedback, InsertDishFeedback, InsertPlan, InsertSession, InsertUserPreference, plans, sessions, userPreferences } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function createUserPreference(pref: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userPreferences).values(pref);
  return result;
}

export async function getUserPreference(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result[0] || null;
}

export async function updateUserPreference(userId: number, updates: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId));
}

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(session);
  return result[0].insertId;
}

export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result[0] || null;
}

export async function getUserSessions(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.createdAt)).limit(limit);
}

export async function createPlan(plan: InsertPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(plans).values(plan);
  return result[0].insertId;
}

export async function getPlanById(planId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  return result[0] || null;
}

export async function getPlanBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(plans).where(eq(plans.sessionId, sessionId)).limit(1);
  return result[0] || null;
}

export async function createDishFeedback(feedback: InsertDishFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dishFeedback).values(feedback);
}

export async function getUserDishFeedback(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dishFeedback).where(eq(dishFeedback.userId, userId));
}
