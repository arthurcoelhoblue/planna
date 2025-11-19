/**
 * Dashboard statistics and analytics
 * Provides user insights and metrics
 */

import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { plans, sessions } from "../drizzle/schema";

/**
 * Get overview statistics for user dashboard
 */
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get total plans created
  const totalPlansResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  const totalPlans = totalPlansResult[0]?.count || 0;

  // Get plans created this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyPlansResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(sessions)
    .where(
      sql`${sessions.userId} = ${userId} AND ${sessions.createdAt} >= ${firstDayOfMonth}`
    );

  const monthlyPlans = monthlyPlansResult[0]?.count || 0;

  // Get most used ingredients (parse inputText from sessions)
  const allSessions = await db
    .select({ inputText: sessions.inputText })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  // Count ingredient occurrences
  const ingredientCounts: Record<string, number> = {};
  
  for (const session of allSessions) {
    const ingredients = session.inputText
      .split(/[,\n]/)
      .map(i => i.trim().toLowerCase())
      .filter(i => i.length > 0);
    
    for (const ing of ingredients) {
      // Remove quantities (e.g., "2kg frango" -> "frango")
      const cleanIng = ing.replace(/^\d+\.?\d*\s*(kg|g|ml|l|un|unidades?|und?)?\s*/i, "").trim();
      if (cleanIng) {
        ingredientCounts[cleanIng] = (ingredientCounts[cleanIng] || 0) + 1;
      }
    }
  }

  // Get top 5 ingredients
  const topIngredients = Object.entries(ingredientCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Get most generated recipes (parse dishes from plans)
  const allPlans = await db
    .select({ dishes: plans.dishes })
    .from(plans)
    .innerJoin(sessions, eq(plans.sessionId, sessions.id))
    .where(eq(sessions.userId, userId));

  const recipeCounts: Record<string, number> = {};
  
  for (const plan of allPlans) {
    try {
      const dishes = JSON.parse(plan.dishes);
      for (const dish of dishes) {
        const name = dish.name?.toLowerCase();
        if (name) {
          recipeCounts[name] = (recipeCounts[name] || 0) + 1;
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  const topRecipes = Object.entries(recipeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Calculate time saved (estimate: 2 hours per plan)
  const timeSavedHours = totalPlans * 2;

  // Get plans by month for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const plansByMonth = await db
    .select({
      month: sql<string>`DATE_FORMAT(${sessions.createdAt}, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
    .from(sessions)
    .where(
      sql`${sessions.userId} = ${userId} AND ${sessions.createdAt} >= ${sixMonthsAgo}`
    )
    .groupBy(sql`DATE_FORMAT(${sessions.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${sessions.createdAt}, '%Y-%m')`);

  return {
    totalPlans,
    monthlyPlans,
    topIngredients,
    topRecipes,
    timeSavedHours,
    plansByMonth: plansByMonth.map(p => ({
      month: p.month,
      count: p.count,
    })),
  };
}

/**
 * Get subscription details for user
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { users, subscriptions } = await import("../drizzle/schema");

  const [user] = await db
    .select({
      tier: users.subscriptionTier,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  // Get active subscription details if exists
  let subscription = null;
  if (user.stripeCustomerId) {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    subscription = sub || null;
  }

  return {
    tier: user.tier,
    stripeCustomerId: user.stripeCustomerId,
    subscription,
  };
}

