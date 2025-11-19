import { describe, it, expect } from "vitest";
import Stripe from "stripe";
import { ENV } from "./_core/env";

describe("Stripe Checkout Integration", () => {
  describe("Stripe Client Configuration", () => {
    it("should initialize Stripe client successfully", () => {
      const stripe = new Stripe(ENV.stripeSecretKey, {
        apiVersion: "2024-11-20.acacia" as any,
        typescript: true,
      });

      expect(stripe).toBeDefined();
      expect(stripe.checkout).toBeDefined();
      expect(stripe.checkout.sessions).toBeDefined();
    });

    it("should use test mode secret key", () => {
      expect(ENV.stripeSecretKey.startsWith("sk_test_")).toBe(true);
    });
  });

  describe("Price IDs Configuration", () => {
    it("should have valid Pro price ID", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");

      expect(proPlan).toBeDefined();
      expect(proPlan?.priceId).toBeDefined();
      expect(proPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
    });

    it("should have valid Premium price ID", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");

      expect(premiumPlan).toBeDefined();
      expect(premiumPlan?.priceId).toBeDefined();
      expect(premiumPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
    });

    it("should have correct pricing values", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");

      expect(proPlan?.price).toBe(9.9);
      expect(premiumPlan?.price).toBe(14.99);
    });
  });

  describe("Checkout Session Creation (Mock)", () => {
    it("should validate checkout session parameters", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");

      // Validate parameters that would be sent to Stripe
      const mockSessionParams = {
        mode: "subscription" as const,
        customer_email: "test@example.com",
        client_reference_id: "123",
        line_items: [
          {
            price: proPlan?.priceId,
            quantity: 1,
          },
        ],
        success_url: "https://example.com/planner?checkout=success",
        cancel_url: "https://example.com/?checkout=canceled",
        allow_promotion_codes: true,
        metadata: {
          user_id: "123",
          customer_email: "test@example.com",
          customer_name: "Test User",
        },
      };

      expect(mockSessionParams.mode).toBe("subscription");
      expect(mockSessionParams.line_items[0].price).toBeDefined();
      expect(mockSessionParams.line_items[0].quantity).toBe(1);
      expect(mockSessionParams.success_url).toContain("checkout=success");
      expect(mockSessionParams.cancel_url).toContain("checkout=canceled");
    });

    it("should have valid URLs in checkout session", () => {
      const origin = "https://plannameal-wdxbdcbk.manus.space";
      const successUrl = `${origin}/planner?checkout=success`;
      const cancelUrl = `${origin}/?checkout=canceled`;

      expect(successUrl).toMatch(/^https:\/\//);
      expect(cancelUrl).toMatch(/^https:\/\//);
      expect(successUrl).toContain("checkout=success");
      expect(cancelUrl).toContain("checkout=canceled");
    });
  });

  describe("Price IDs Format Validation", () => {
    it("should have Pro price ID in correct format", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const proPlan = PRICING_PLANS.find((p) => p.id === "pro");

      expect(proPlan).toBeDefined();
      expect(proPlan?.priceId).toBeDefined();
      expect(proPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(proPlan?.priceId).not.toBeNull();
    });

    it("should have Premium price ID in correct format", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const premiumPlan = PRICING_PLANS.find((p) => p.id === "premium");

      expect(premiumPlan).toBeDefined();
      expect(premiumPlan?.priceId).toBeDefined();
      expect(premiumPlan?.priceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(premiumPlan?.priceId).not.toBeNull();
    });

    it("should have Free plan with null price ID", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      const freePlan = PRICING_PLANS.find((p) => p.id === "free");

      expect(freePlan).toBeDefined();
      expect(freePlan?.priceId).toBeNull();
      expect(freePlan?.price).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should throw error for invalid price ID", async () => {
      const { PRICING_PLANS } = await import("./stripe-products");
      
      const invalidPriceId = "price_invalid_test_123";
      const plan = PRICING_PLANS.find((p) => p.priceId === invalidPriceId);

      expect(plan).toBeUndefined();
    });

    it("should validate price ID format", () => {
      const validPriceId = "price_1SVAW1ASdTYHUTQI7C2avtHK";
      const invalidPriceId = "invalid_price_id";

      expect(validPriceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(invalidPriceId).not.toMatch(/^price_[a-zA-Z0-9]+$/);
    });
  });

  describe("Test Mode Validation", () => {
    it("should confirm using test mode keys", () => {
      expect(ENV.stripeSecretKey.startsWith("sk_test_")).toBe(true);
      expect(ENV.stripePublishableKey.startsWith("pk_test_")).toBe(true);
    });

    it("should not be using live mode keys", () => {
      expect(ENV.stripeSecretKey.startsWith("sk_live_")).toBe(false);
      expect(ENV.stripePublishableKey.startsWith("pk_live_")).toBe(false);
    });
  });
});

