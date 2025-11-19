import { describe, expect, it } from "vitest";
import nodemailer from "nodemailer";

describe("SMTP Configuration Validation", () => {
  it("should have all SMTP environment variables configured", () => {
    expect(process.env.EMAIL_HOST).toBeDefined();
    expect(process.env.EMAIL_PORT).toBeDefined();
    expect(process.env.EMAIL_SECURE).toBeDefined();
    expect(process.env.EMAIL_USER).toBeDefined();
    expect(process.env.EMAIL_PASS).toBeDefined();
    expect(process.env.EMAIL_FROM).toBeDefined();
  });

  it("should have valid Gmail SMTP host", () => {
    expect(process.env.EMAIL_HOST).toBe("smtp.gmail.com");
  });

  it("should have valid SMTP port", () => {
    const port = parseInt(process.env.EMAIL_PORT!);
    expect(port).toBe(587);
  });

  it("should have valid email format for EMAIL_USER", () => {
    const email = process.env.EMAIL_USER;
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("should have non-empty password", () => {
    const pass = process.env.EMAIL_PASS;
    expect(pass).toBeDefined();
    expect(pass!.length).toBeGreaterThan(0);
  });

  it("should have valid EMAIL_FROM format", () => {
    const from = process.env.EMAIL_FROM;
    expect(from).toMatch(/^.+<[^\s@]+@[^\s@]+\.[^\s@]+>$/);
  });

  it("should create SMTP transporter successfully", () => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    expect(transporter).toBeDefined();
  });

  it("should verify SMTP connection", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection (lightweight check, doesn't send email)
    await expect(transporter.verify()).resolves.toBe(true);
  }, 10000); // 10s timeout for network call
});

