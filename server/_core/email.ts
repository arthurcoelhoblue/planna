/**
 * Email service with SMTP (Gmail)
 * Priority: SMTP > Manus notification API (fallback)
 */

import nodemailer from "nodemailer";
import { ENV } from "./env";

/**
 * Email configuration from environment variables
 */
interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

/**
 * Get email configuration from environment
 */
function getEmailConfig(): EmailConfig {
  return {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "Planna <noreply@planna.app>",
  };
}

/**
 * Check if SMTP is configured
 */
function isSmtpConfigured(): boolean {
  const config = getEmailConfig();
  return !!(config.host && config.port && config.user && config.pass);
}

/**
 * Send email via SMTP (nodemailer)
 */
async function sendViaSmtp(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  try {
    const config = getEmailConfig();

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[Email] Sent via SMTP to ${to}`);
    return true;
  } catch (error) {
    console.error("[Email] SMTP error:", error);
    return false;
  }
}

/**
 * Send email via Manus notification API (fallback)
 * Uses the owner notification system to send emails
 */
async function sendViaManusApi(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  try {
    // Build endpoint URL (same as notification.ts)
    const normalizedBase = ENV.forgeApiUrl.endsWith("/")
      ? ENV.forgeApiUrl
      : `${ENV.forgeApiUrl}/`;
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendNotification",
      normalizedBase
    ).toString();

    // Format email content as notification
    const title = `${subject} (para: ${to})`;
    const content = `${text}\n\n---\nHTML:\n${html}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[Email] Manus API error (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Sent via Manus API to ${to}`);
    return true;
  } catch (error) {
    console.error("[Email] Manus API error:", error);
    return false;
  }
}

/**
 * Send email using configured method
 * Priority: SMTP (Gmail) > Manus API (fallback)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  // Try SMTP (Gmail) first
  if (isSmtpConfigured()) {
    const sent = await sendViaSmtp(to, subject, html, text);
    if (sent) return true;
    console.warn("[Email] SMTP failed, trying Manus API fallback...");
  }

  // Fallback to Manus API (sends to owner as notification)
  console.warn("[Email] Using Manus API fallback (will notify owner, not user)");
  return sendViaManusApi(to, subject, html, text);
}

/**
 * Send verification code email
 * Uses SMTP (Gmail) for direct delivery to user
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<boolean> {
  console.log("[Email] sendVerificationEmail called with:", { email, code: code.substring(0, 2) + "****", name });
  console.log("[Email] SMTP configured:", isSmtpConfigured());

  const subject = "Confirme seu email - Planna";
  const html = `
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
  `;
  const text = `Bem-vindo ao Planna${name ? `, ${name}` : ""}!\n\nPara ativar sua conta, use o código de verificação: ${code}\n\nEste código expira em 15 minutos.\n\nSe você não criou esta conta, ignore este email.`;

  return sendEmail(email, subject, html, text);
}

/**
 * Send password reset email
 * Uses SMTP (Gmail) for direct delivery to user
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  name?: string
): Promise<boolean> {
  const subject = "Redefinir sua senha - Planna";
  const html = `
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
  `;
  const text = `Redefinir Senha${name ? ` - ${name}` : ""}\n\nVocê solicitou a redefinição de senha da sua conta no Planna.\n\nAcesse este link para criar uma nova senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`;

  return sendEmail(email, subject, html, text);
}

