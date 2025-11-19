import { describe, expect, it } from "vitest";
import { Resend } from "resend";

describe("Resend API Key Validation", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).not.toBe("");
  });

  it("should have valid Resend API key format", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toMatch(/^re_[a-zA-Z0-9_]+$/);
  });

  it("should initialize Resend client successfully", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(() => new Resend(apiKey)).not.toThrow();
  });

  it("should have API key with minimum length", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey!.length).toBeGreaterThan(20);
  });

  it("should validate API key by attempting to create client", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const resend = new Resend(apiKey);
    
    // Verify the client was created
    expect(resend).toBeDefined();
    expect(resend.emails).toBeDefined();
  });
});

