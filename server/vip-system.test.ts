import { describe, it, expect } from "vitest";
import { isVIPEmail, canAccess, hasReachedMonthlyLimit } from "./paywall";

describe("VIP System", () => {
  describe("isVIPEmail", () => {
    it("should recognize VIP email (lowercase)", () => {
      expect(isVIPEmail("arthurcsantos@gmail.com")).toBe(true);
    });

    it("should recognize second VIP email (lowercase)", () => {
      expect(isVIPEmail("arthur@tokeniza.com.br")).toBe(true);
    });

    it("should recognize VIP email (uppercase)", () => {
      expect(isVIPEmail("ARTHURCSANTOS@GMAIL.COM")).toBe(true);
      expect(isVIPEmail("ARTHUR@TOKENIZA.COM.BR")).toBe(true);
    });

    it("should recognize VIP email (mixed case)", () => {
      expect(isVIPEmail("ArthurCSantos@Gmail.com")).toBe(true);
      expect(isVIPEmail("Arthur@Tokeniza.Com.Br")).toBe(true);
    });

    it("should reject non-VIP email", () => {
      expect(isVIPEmail("regular@example.com")).toBe(false);
    });

    it("should handle null email", () => {
      expect(isVIPEmail(null)).toBe(false);
    });

    it("should handle undefined email", () => {
      expect(isVIPEmail(undefined)).toBe(false);
    });

    it("should handle empty string", () => {
      expect(isVIPEmail("")).toBe(false);
    });
  });

  describe("canAccess - VIP Override", () => {
    it("should allow VIP to access all features (free tier)", () => {
      const vipEmail = "arthurcsantos@gmail.com";
      
      expect(canAccess("free", "canAccessCalories", vipEmail)).toBe(true);
      expect(canAccess("free", "canAccessDiet", vipEmail)).toBe(true);
      expect(canAccess("free", "canAccessAdvancedFeatures", vipEmail)).toBe(true);
      expect(canAccess("free", "canExportPDF", vipEmail)).toBe(true);
    });

    it("should respect normal limits for non-VIP users", () => {
      const regularEmail = "regular@example.com";
      
      expect(canAccess("free", "canAccessCalories", regularEmail)).toBe(false);
      expect(canAccess("free", "canAccessDiet", regularEmail)).toBe(false);
      expect(canAccess("free", "canExportPDF", regularEmail)).toBe(false);
    });

    it("should work without email parameter (backward compatibility)", () => {
      expect(canAccess("free", "canAccessCalories")).toBe(false);
      expect(canAccess("premium", "canAccessCalories")).toBe(true);
    });
  });

  describe("hasReachedMonthlyLimit - VIP Override", () => {
    it("should never reach limit for VIP users", async () => {
      const vipEmail = "arthurcsantos@gmail.com";
      
      // VIP users never reach limit, regardless of tier or usage
      const result = await hasReachedMonthlyLimit(999, "free", vipEmail);
      expect(result).toBe(false);
    });

    it("should check limits for non-VIP users (premium = unlimited)", async () => {
      const regularEmail = "regular@example.com";
      
      // Premium tier has unlimited plans (-1)
      const result = await hasReachedMonthlyLimit(999, "premium", regularEmail);
      expect(result).toBe(false);
    });

    it("should work without email parameter (backward compatibility)", async () => {
      // Premium tier should still be unlimited without email
      const result = await hasReachedMonthlyLimit(999, "premium");
      expect(result).toBe(false);
    });
  });

  describe("VIP Email List", () => {
    it("should have at least one VIP email configured", () => {
      expect(isVIPEmail("arthurcsantos@gmail.com")).toBe(true);
    });

    it("should be case-insensitive", () => {
      const variations = [
        "arthurcsantos@gmail.com",
        "ARTHURCSANTOS@GMAIL.COM",
        "ArthurCSantos@Gmail.com",
        "aRtHuRcSaNtOs@GmAiL.cOm",
      ];

      variations.forEach((email) => {
        expect(isVIPEmail(email)).toBe(true);
      });
    });
  });

  describe("VIP Benefits", () => {
    it("should list all VIP benefits", () => {
      const benefits = {
        unlimitedPlans: true,
        accessAllFeatures: true,
        noPaywall: true,
        accessCalories: true,
        accessDiet: true,
        accessAdvancedFeatures: true,
        exportPDF: true,
        shareWhatsApp: true,
      };

      Object.values(benefits).forEach((benefit) => {
        expect(benefit).toBe(true);
      });
    });

    it("should bypass all tier restrictions", () => {
      const vipEmail = "arthurcsantos@gmail.com";
      const allFeatures: Array<keyof typeof import("./paywall").TIER_LIMITS.free> = [
        "canAccessCalories",
        "canAccessDiet",
        "canAccessAdvancedFeatures",
        "canExportPDF",
        "canShareWhatsApp",
      ];

      // VIP should have access to all features regardless of tier
      allFeatures.forEach((feature) => {
        expect(canAccess("free", feature, vipEmail)).toBe(true);
      });
    });
  });
});

