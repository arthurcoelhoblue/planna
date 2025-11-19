/**
 * Email service using Resend API
 * Sends emails directly to users (not via owner notification)
 */

import { Resend } from "resend";

/**
 * Initialize Resend client
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] API key not configured");
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send verification code email via Resend
 */
export async function sendVerificationEmailViaResend(
  email: string,
  code: string,
  name?: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error("[Resend] Cannot send email: API key not configured");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Planna <onboarding@resend.dev>", // Resend test domain
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
    });

    if (error) {
      console.error("[Resend] Error sending email:", error);
      return false;
    }

    console.log(`[Resend] Email sent successfully to ${email} (ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error("[Resend] Exception sending email:", error);
    return false;
  }
}

/**
 * Send password reset email via Resend
 */
export async function sendPasswordResetEmailViaResend(
  email: string,
  resetUrl: string,
  name?: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error("[Resend] Cannot send email: API key not configured");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Planna <onboarding@resend.dev>", // Resend test domain
      to: email,
      subject: "Redefinir sua senha - Planna",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Redefinir Senha${name ? ` - ${name}` : ""}</h2>
          <p>Você solicitou a redefinição de senha da sua conta no Planna.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="background-color: #f3f4f6; padding: 10px; word-break: break-all; font-size: 12px;">
            ${resetUrl}
          </p>
          <p><strong>Este link expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Planna - Planejador de Marmitas<br>
            Planejamento inteligente de marmitas
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Error sending password reset email:", error);
      return false;
    }

    console.log(`[Resend] Password reset email sent successfully to ${email} (ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error("[Resend] Exception sending password reset email:", error);
    return false;
  }
}

