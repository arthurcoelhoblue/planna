/**
 * Plan sharing service
 * Handles generation and access of shared meal plans
 */

import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { plans, sessions } from "../drizzle/schema";
import { randomBytes } from "crypto";

/**
 * Generate a unique share token for a plan
 */
export function generateShareToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a share link for a plan
 * Returns the share token
 */
export async function generateShareLink(planId: number, userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify plan belongs to user
  const [plan] = await db
    .select({ id: plans.id, sessionId: plans.sessionId, shareToken: plans.shareToken })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  if (!plan) {
    throw new Error("Plano não encontrado");
  }

  // Verify ownership
  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.id, plan.sessionId))
    .limit(1);

  if (!session || session.userId !== userId) {
    throw new Error("Você não tem permissão para compartilhar este plano");
  }

  // If already has a share token, return it
  if (plan.shareToken) {
    return plan.shareToken;
  }

  // Generate new token
  const token = generateShareToken();

  // Update plan with token
  await db.update(plans).set({ shareToken: token }).where(eq(plans.id, planId));

  return token;
}

/**
 * Get a shared plan by token (public access)
 * Increments share count
 */
export async function getSharedPlan(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find plan by token
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.shareToken, token))
    .limit(1);

  if (!plan) {
    throw new Error("Plano compartilhado não encontrado");
  }

  // Increment share count
  await db
    .update(plans)
    .set({ shareCount: (plan.shareCount || 0) + 1 })
    .where(eq(plans.id, plan.id));

  // Get session info for additional context
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, plan.sessionId))
    .limit(1);

  return {
    plan,
    session,
  };
}

/**
 * Revoke share link (delete token)
 */
export async function revokeShareLink(planId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const [plan] = await db
    .select({ sessionId: plans.sessionId })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  if (!plan) {
    throw new Error("Plano não encontrado");
  }

  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.id, plan.sessionId))
    .limit(1);

  if (!session || session.userId !== userId) {
    throw new Error("Você não tem permissão para revogar este link");
  }

  // Remove token
  await db.update(plans).set({ shareToken: null, shareCount: 0 }).where(eq(plans.id, planId));
}

