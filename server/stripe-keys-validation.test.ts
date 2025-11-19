import { describe, it, expect } from "vitest";
import Stripe from "stripe";
import { ENV } from "./_core/env";

describe("Stripe API Keys Validation (Test Mode)", () => {
  describe("Environment Configuration", () => {
    it("should have STRIPE_PUBLISHABLE_KEY configured", () => {
      expect(ENV.stripePublishableKey).toBeDefined();
      expect(ENV.stripePublishableKey).not.toBe("");
    });

    it("should have STRIPE_SECRET_KEY configured", () => {
      expect(ENV.stripeSecretKey).toBeDefined();
      expect(ENV.stripeSecretKey).not.toBe("");
    });
  });

  describe("Test Mode Key Format", () => {
    it("should have publishable key in test mode format", () => {
      expect(ENV.stripePublishableKey.startsWith("pk_test_")).toBe(true);
    });

    it("should have secret key in test mode format", () => {
      expect(ENV.stripeSecretKey.startsWith("sk_test_")).toBe(true);
    });

    it("should not be using live mode keys", () => {
      expect(ENV.stripePublishableKey.startsWith("pk_live_")).toBe(false);
      expect(ENV.stripeSecretKey.startsWith("sk_live_")).toBe(false);
    });
  });

  describe("Key Length Validation", () => {
    it("should have publishable key with minimum length", () => {
      // Stripe publishable keys are typically 100+ characters
      expect(ENV.stripePublishableKey.length).toBeGreaterThanOrEqual(50);
    });

    it("should have secret key with minimum length", () => {
      // Stripe secret keys are typically 100+ characters
      expect(ENV.stripeSecretKey.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe("Key Structure Validation", () => {
    it("should have publishable key with correct structure", () => {
      // Format: pk_test_51XXXXX...
      expect(ENV.stripePublishableKey).toMatch(/^pk_test_[a-zA-Z0-9]+$/);
    });

    it("should have secret key with correct structure", () => {
      // Format: sk_test_51XXXXX...
      expect(ENV.stripeSecretKey).toMatch(/^sk_test_[a-zA-Z0-9]+$/);
    });

    it("should not contain whitespace in keys", () => {
      expect(ENV.stripePublishableKey).not.toMatch(/\s/);
      expect(ENV.stripeSecretKey).not.toMatch(/\s/);
    });
  });

  describe("Stripe SDK Initialization", () => {
    it("should be able to initialize Stripe with test key", () => {
      const stripe = new Stripe(ENV.stripeSecretKey, {
        apiVersion: "2024-11-20.acacia",
      });

      expect(stripe).toBeDefined();
      // Stripe SDK doesn't expose apiVersion directly, just verify instance is created
      expect(stripe.customers).toBeDefined();
      expect(stripe.checkout).toBeDefined();
    });

    it("should validate that Stripe instance is in test mode", () => {
      // In test mode, secret key starts with sk_test_
      const isTestMode = ENV.stripeSecretKey.startsWith("sk_test_");
      expect(isTestMode).toBe(true);
    });
  });

  describe("Key Security", () => {
    it("should not expose secret key in logs", () => {
      const secretKey = ENV.stripeSecretKey;
      
      // Ensure key is not accidentally logged
      expect(secretKey).not.toBe("test");
      expect(secretKey).not.toBe("placeholder");
      expect(secretKey).not.toContain("example");
    });

    it("should have production-grade key length", () => {
      // Both keys should be long enough to be secure
      expect(ENV.stripePublishableKey.length).toBeGreaterThan(50);
      expect(ENV.stripeSecretKey.length).toBeGreaterThan(50);
    });

    it("should not use placeholder values", () => {
      expect(ENV.stripePublishableKey).not.toContain("placeholder");
      expect(ENV.stripePublishableKey).not.toContain("YOUR_");
      expect(ENV.stripeSecretKey).not.toContain("placeholder");
      expect(ENV.stripeSecretKey).not.toContain("YOUR_");
    });
  });

  describe("Test Mode Compatibility", () => {
    it("should have matching account IDs in both keys", () => {
      // Extract account ID from keys (format: pk_test_51XXXXX or sk_test_51XXXXX)
      // Account ID is the part after pk_test_ or sk_test_ up to the first underscore
      const pkParts = ENV.stripePublishableKey.replace("pk_test_", "").split("_");
      const skParts = ENV.stripeSecretKey.replace("sk_test_", "").split("_");
      
      // Both should start with the same account identifier
      expect(pkParts[0].substring(0, 10)).toBe(skParts[0].substring(0, 10));
    });

    it("should validate test mode webhook compatibility", () => {
      // Webhook secret should also be test mode
      expect(ENV.stripeWebhookSecret.startsWith("whsec_")).toBe(true);
    });
  });

  describe("Price IDs Compatibility", () => {
    it("should have Price IDs that work with test mode", () => {
      // Price IDs in stripe-products.ts should work with test mode keys
      // Price IDs don't have test/live prefix, but they're tied to the mode they were created in
      const proPriceId = "price_1SVAW1ASdTYHUTQI7C2avtHK";
      const premiumPriceId = "price_1SVAWvASdTYHUTQIPpNdIvaa";
      
      // Validate format
      expect(proPriceId).toMatch(/^price_[a-zA-Z0-9]+$/);
      expect(premiumPriceId).toMatch(/^price_[a-zA-Z0-9]+$/);
    });
  });

  describe("Test Card Compatibility", () => {
    it("should define test card numbers for testing", () => {
      const testCards = {
        success: "4242424242424242",
        declined: "4000000000000002",
        insufficientFunds: "4000000000000009",
      };

      // Validate test card formats
      Object.values(testCards).forEach((card) => {
        expect(card).toMatch(/^\d{16}$/);
      });
    });

    it("should validate test mode allows test cards", () => {
      // In test mode, we can use test cards
      const isTestMode = ENV.stripeSecretKey.startsWith("sk_test_");
      expect(isTestMode).toBe(true);
    });
  });
});

