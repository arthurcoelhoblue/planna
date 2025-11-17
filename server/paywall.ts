/**
 * Paywall - Controle de acesso baseado em tier
 */

export type SubscriptionTier = "free" | "pro" | "premium";

/**
 * Limites por tier
 */
export const TIER_LIMITS = {
  free: {
    maxPlansPerMonth: 2, // Máximo de planos por mês
    canAccessCalories: false, // Acesso a calorias
    canAccessDiet: false, // Acesso a dietas personalizadas
    canAccessAdvancedFeatures: false, // Features avançadas
    canExportPDF: false, // Exportar PDF
    canShareWhatsApp: true, // Compartilhar WhatsApp (sempre liberado)
  },
  pro: {
    maxPlansPerMonth: 10,
    canAccessCalories: true,
    canAccessDiet: true,
    canAccessAdvancedFeatures: false,
    canExportPDF: true,
    canShareWhatsApp: true,
  },
  premium: {
    maxPlansPerMonth: -1, // Ilimitado
    canAccessCalories: true,
    canAccessDiet: true,
    canAccessAdvancedFeatures: true,
    canExportPDF: true,
    canShareWhatsApp: true,
  },
};

/**
 * Verifica se o usuário pode acessar uma feature
 */
export function canAccess(
  tier: SubscriptionTier,
  feature: keyof typeof TIER_LIMITS.free
): boolean {
  return TIER_LIMITS[tier][feature] as boolean;
}

/**
 * Retorna o limite de planos por mês
 */
export function getMaxPlansPerMonth(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxPlansPerMonth;
}

/**
 * Verifica se o usuário atingiu o limite de planos no mês
 */
export async function hasReachedMonthlyLimit(
  userId: number,
  tier: SubscriptionTier
): Promise<boolean> {
  const maxPlans = getMaxPlansPerMonth(tier);
  if (maxPlans === -1) return false; // Ilimitado

  const { getDb } = await import("./db");
  const { sessions } = await import("../drizzle/schema");
  const { eq, and, gte } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) return false;

  // Contar planos criados no mês atual
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gte(sessions.createdAt, startOfMonth)));

  return count.length >= maxPlans;
}

/**
 * Mensagem de upgrade para o usuário
 */
export function getUpgradeMessage(tier: SubscriptionTier, feature: string): string {
  if (tier === "free") {
    return `Esta funcionalidade está disponível apenas para assinantes Pro e Premium. Faça upgrade para desbloquear!`;
  }
  if (tier === "pro") {
    return `Esta funcionalidade está disponível apenas para assinantes Premium. Faça upgrade para desbloquear!`;
  }
  return "";
}

