/**
 * Produtos e preços do Planna
 * Centraliza definição de planos de assinatura
 */

export interface PlanFeatures {
  plansPerMonth: number;
  calorieTracking: boolean;
  dietSupport: boolean;
  advancedRecipes: boolean;
  prioritySupport: boolean;
  exportPDF: boolean;
  whatsappIntegration: boolean;
}

export interface PricingPlan {
  id: "free" | "pro" | "premium";
  name: string;
  description: string;
  price: number; // em BRL
  priceId: string | null; // Stripe Price ID (null para free)
  interval: "month" | "year" | null;
  features: PlanFeatures;
  cta: string;
  popular?: boolean;
}

/**
 * Planos de assinatura do Planna
 * IMPORTANTE: Após criar os produtos no Stripe Dashboard, atualizar os priceId aqui
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Grátis",
    description: "Experimente o básico",
    price: 0,
    priceId: null,
    interval: null,
    features: {
      plansPerMonth: 3,
      calorieTracking: false,
      dietSupport: false,
      advancedRecipes: false,
      prioritySupport: false,
      exportPDF: true,
      whatsappIntegration: true,
    },
    cta: "Começar Grátis",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para quem leva a sério",
    price: 9.90,
    priceId: "price_1SUPvOKHYuEw9LKlDGmXKmjD", // Planna Pro (R$ 9,90/mês)
    interval: "month",
    features: {
      plansPerMonth: 20,
      calorieTracking: true,
      dietSupport: true,
      advancedRecipes: true,
      prioritySupport: false,
      exportPDF: true,
      whatsappIntegration: true,
    },
    cta: "Assinar Pro",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Tudo ilimitado",
    price: 14.99,
    priceId: "price_1SVInaKHYuEw9LKlKEAg3pps", // Planna Premium (R$ 14,99/mês)
    interval: "month",
    features: {
      plansPerMonth: -1, // Ilimitado
      calorieTracking: true,
      dietSupport: true,
      advancedRecipes: true,
      prioritySupport: true,
      exportPDF: true,
      whatsappIntegration: true,
    },
    cta: "Assinar Premium",
  },
];

/**
 * Verifica se usuário pode criar mais planos baseado no tier
 */
export function canCreatePlan(tier: "free" | "pro" | "premium", plansThisMonth: number): boolean {
  const plan = PRICING_PLANS.find((p) => p.id === tier);
  if (!plan) return false;

  const limit = plan.features.plansPerMonth;
  if (limit === -1) return true; // Ilimitado
  return plansThisMonth < limit;
}

/**
 * Retorna features do tier
 */
export function getTierFeatures(tier: "free" | "pro" | "premium"): PlanFeatures | null {
  const plan = PRICING_PLANS.find((p) => p.id === tier);
  return plan?.features || null;
}

