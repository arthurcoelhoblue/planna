/**
 * Serviço de gerenciamento de assinaturas
 */

import { eq, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import { subscriptions, users } from "../drizzle/schema";

/**
 * Cria ou atualiza assinatura no banco
 */
export async function upsertSubscription(data: {
  userId: number;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
    .limit(1);

  if (existing.length > 0) {
    // Atualizar
    await db
      .update(subscriptions)
      .set({
        status: data.status,
        stripePriceId: data.stripePriceId,
        currentPeriodEnd: data.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing[0].id));
  } else {
    // Criar
    await db.insert(subscriptions).values({
      userId: data.userId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
    });
  }
}

/**
 * Atualiza tier do usuário baseado na assinatura
 */
export async function updateUserTier(userId: number, tier: "free" | "pro" | "premium") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId));
}

/**
 * Busca assinatura ativa do usuário
 */
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Conta quantos planos o usuário criou este mês
 */
export async function countPlansThisMonth(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Importar sessions aqui para evitar circular dependency
  const { sessions } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gte(sessions.createdAt, startOfMonth)));

  return result.length;
}

