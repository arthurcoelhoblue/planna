import { describe, it, expect, beforeEach } from "vitest";
import { generateShareToken, generateShareLink, getSharedPlan, revokeShareLink } from "./share-service";

describe("Share Service", () => {
  describe("generateShareToken", () => {
    it("should generate a unique token", () => {
      const token1 = generateShareToken();
      const token2 = generateShareToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it("should generate hex string", () => {
      const token = generateShareToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("Share Link Generation", () => {
    it("should generate valid share token format", () => {
      const token = generateShareToken();
      
      // Token should be 64 characters (32 bytes in hex)
      expect(token).toHaveLength(64);
      
      // Token should only contain hex characters
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it("should generate unique tokens", () => {
      const tokens = new Set();
      
      // Generate 100 tokens
      for (let i = 0; i < 100; i++) {
        tokens.add(generateShareToken());
      }
      
      // All should be unique
      expect(tokens.size).toBe(100);
    });
  });

  describe("Share URL Format", () => {
    it("should create valid share URL structure", () => {
      const token = generateShareToken();
      const baseUrl = "https://example.com";
      const shareUrl = `${baseUrl}/shared/${token}`;
      
      expect(shareUrl).toContain("/shared/");
      expect(shareUrl).toContain(token);
      expect(shareUrl.startsWith(baseUrl)).toBe(true);
    });
  });

  describe("Token Security", () => {
    it("should generate cryptographically random tokens", () => {
      const tokens: string[] = [];
      
      // Generate multiple tokens
      for (let i = 0; i < 10; i++) {
        tokens.push(generateShareToken());
      }
      
      // Check that no two tokens are similar (no sequential patterns)
      for (let i = 0; i < tokens.length - 1; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          // Calculate Hamming distance (should be high for random tokens)
          let differences = 0;
          for (let k = 0; k < tokens[i].length; k++) {
            if (tokens[i][k] !== tokens[j][k]) differences++;
          }
          
          // At least 50% of characters should be different
          expect(differences).toBeGreaterThan(tokens[i].length / 2);
        }
      }
    });

    it("should not contain predictable patterns", () => {
      const token = generateShareToken();
      
      // Should not be all same character
      expect(token).not.toMatch(/^(.)\1+$/);
      
      // Should not be sequential
      expect(token).not.toMatch(/0123456789abcdef/);
      expect(token).not.toMatch(/fedcba9876543210/);
    });
  });
});

