/**
 * Email verification helper for 2FA during registration
 * Sends verification codes via email
 */

import { sendVerificationEmail as sendEmail } from "./email";

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code via email
 * Re-exports from email.ts for backward compatibility
 */
export { sendEmail as sendVerificationEmail };

