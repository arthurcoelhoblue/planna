/**
 * Email verification helper for 2FA during registration
 * Sends verification codes via email using the built-in notification API
 */

import { ENV } from "./env";

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code via email
 * Uses the built-in notification API to send emails
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/notification/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: "Confirme seu email - Planna",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Bem-vindo ao Planna${name ? `, ${name}` : ""}!</h2>
            <p>Para ativar sua conta, use o código de verificação abaixo:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p>Este código expira em 15 minutos.</p>
            <p>Se você não criou esta conta, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Planna - Planejador de Marmitas<br>
              Planejamento inteligente de marmitas
            </p>
          </div>
        `,
        text: `Bem-vindo ao Planna${name ? `, ${name}` : ""}!\n\nPara ativar sua conta, use o código de verificação: ${code}\n\nEste código expira em 15 minutos.\n\nSe você não criou esta conta, ignore este email.`,
      }),
    });

    if (!response.ok) {
      console.error("[EmailVerification] Failed to send email:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[EmailVerification] Error sending email:", error);
    return false;
  }
}

