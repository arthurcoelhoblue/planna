import { describe, it, expect } from "vitest";
import { PRICING_PLANS } from "./stripe-products";

describe("Stripe Integration", () => {
  describe("Price IDs Configuration", () => {
    it("should have valid Price ID for Pro plan", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      expect(proPlan).toBeDefined();
      expect(proPlan?.priceId).toBeDefined();
      expect(proPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(proPlan?.priceId).not.toBe("price_pro_placeholder");
    });

    it("should have valid Price ID for Premium plan", () => {
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");
      expect(premiumPlan).toBeDefined();
      expect(premiumPlan?.priceId).toBeDefined();
      expect(premiumPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(premiumPlan?.priceId).not.toBe("price_premium_placeholder");
    });

    it("should have correct Pro Price ID from Stripe", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      expect(proPlan?.priceId).toBe("price_1SUPvOKHYuEw9LKlDGmXKmjD");
    });

    it("should have correct Premium Price ID from Stripe", () => {
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");
      expect(premiumPlan?.priceId).toBe("price_1SVInaKHYuEw9LKlKEAg3pps");
    });
  });

  describe("Pricing Configuration", () => {
    it("should have correct Pro price (R$ 9.90)", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      expect(proPlan?.price).toBe(9.90);
    });

    it("should have correct Premium price (R$ 14.99)", () => {
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");
      expect(premiumPlan?.price).toBe(14.99);
    });

    it("should have Free plan with price 0", () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === "free");
      expect(freePlan?.price).toBe(0);
      expect(freePlan?.priceId).toBeNull();
    });
  });

  describe("Plan Features", () => {
    it("should have correct features for Pro plan", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      expect(proPlan?.features.plansPerMonth).toBe(20);
      expect(proPlan?.features.calorieTracking).toBe(true);
      expect(proPlan?.features.dietSupport).toBe(true);
      expect(proPlan?.features.advancedRecipes).toBe(true);
      expect(proPlan?.features.exportPDF).toBe(true);
    });

    it("should have correct features for Premium plan", () => {
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");
      expect(premiumPlan?.features.plansPerMonth).toBe(-1); // Unlimited
      expect(premiumPlan?.features.calorieTracking).toBe(true);
      expect(premiumPlan?.features.dietSupport).toBe(true);
      expect(premiumPlan?.features.prioritySupport).toBe(true);
    });

    it("should mark Pro as popular plan", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      expect(proPlan?.popular).toBe(true);
    });
  });

  describe("Plan Intervals", () => {
    it("should have monthly interval for paid plans", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");
      
      expect(proPlan?.interval).toBe("month");
      expect(premiumPlan?.interval).toBe("month");
    });

    it("should have null interval for free plan", () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === "free");
      expect(freePlan?.interval).toBeNull();
    });
  });

  describe("Price ID Format Validation", () => {
    it("should have Price IDs with correct Stripe format", () => {
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");

      // Stripe Price IDs always start with "price_" followed by 24 alphanumeric characters
      const stripeIdPattern = /^price_[a-zA-Z0-9]{24,}$/;
      
      expect(proPlan?.priceId).toMatch(stripeIdPattern);
      expect(premiumPlan?.priceId).toMatch(stripeIdPattern);
    });

    it("should not contain placeholder values", () => {
      const allPlans = PRICING_PLANS.filter((p) => p.priceId !== null);
      
      allPlans.forEach((plan) => {
        expect(plan.priceId).not.toContain("placeholder");
        expect(plan.priceId).not.toContain("test");
        expect(plan.priceId).not.toContain("example");
      });
    });
  });

  describe("Plan Descriptions", () => {
    it("should have meaningful descriptions for all plans", () => {
      PRICING_PLANS.forEach((plan) => {
        expect(plan.description).toBeDefined();
        expect(plan.description.length).toBeGreaterThan(5);
      });
    });

    it("should have clear CTAs for all plans", () => {
      PRICING_PLANS.forEach((plan) => {
        expect(plan.cta).toBeDefined();
        expect(plan.cta.length).toBeGreaterThan(3);
      });
    });
  });
});

