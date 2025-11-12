/**
 * Email service for sending password reset magic links
 * Uses Resend for transactional email delivery
 */

import { Resend } from 'resend';
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Get Resend client with credentials from Replit connector
 */
async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    console.warn('Resend connector not available, will log to console instead');
    return null;
  }

  try {
    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings.api_key) {
      console.warn('Resend not connected, will log to console instead');
      return null;
    }

    return {
      client: new Resend(connectionSettings.settings.api_key),
      fromEmail: connectionSettings.settings.from_email || 'Spirit Love Play <noreply@spiritloveplay.app>'
    };
  } catch (error) {
    console.warn('Error fetching Resend credentials:', error);
    return null;
  }
}

/**
 * Send password reset email with magic link
 */
export async function sendPasswordResetEmail(
  recipientEmail: string,
  resetToken: string
): Promise<void> {
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.email, recipientEmail))
    .limit(1);

  const recipientName = user?.name || "User";

  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000";
  
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const emailConfig: EmailConfig = {
    to: recipientEmail,
    subject: "Password Reset - Spirit Love Play",
    html: generateResetEmailHTML(recipientName, resetUrl),
    text: generateResetEmailText(recipientName, resetUrl),
  };

  // Try to send via Resend
  const resendClient = await getResendClient();
  
  if (resendClient) {
    try {
      await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: emailConfig.to,
        subject: emailConfig.subject,
        html: emailConfig.html,
        text: emailConfig.text,
      });
      console.log(`✅ Password reset email sent to ${emailConfig.to}`);
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      console.log('Falling back to console logging:');
      logEmailToConsole(emailConfig);
    }
  } else {
    // Fallback to console logging in development
    logEmailToConsole(emailConfig);
  }
}

/**
 * Log email to console (development mode fallback)
 */
function logEmailToConsole(config: EmailConfig): void {
  console.log("\n" + "=".repeat(80));
  console.log("📧 PASSWORD RESET EMAIL");
  console.log("=".repeat(80));
  console.log(`To: ${config.to}`);
  console.log(`Subject: ${config.subject}`);
  console.log("\n" + "-".repeat(80));
  console.log("TEXT VERSION:");
  console.log("-".repeat(80));
  console.log(config.text);
  console.log("\n" + "-".repeat(80));
  console.log("HTML VERSION:");
  console.log("-".repeat(80));
  console.log(config.html);
  console.log("=".repeat(80) + "\n");
}

/**
 * Generate HTML email content
 */
function generateResetEmailHTML(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #f9a8d4 0%, #fce7f3 50%, #fbbf24 100%);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }
    .button {
      display: inline-block;
      background: #ec4899;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.3s;
    }
    .button:hover {
      background: #db2777;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #666;
    }
    .heart {
      font-size: 24px;
      color: #ec4899;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="heart">❤️</div>
    <h1 style="color: #ec4899; margin: 20px 0;">Password Reset Request</h1>
    <p style="font-size: 16px;">Hi ${name},</p>
    <p style="font-size: 16px;">
      We received a request to reset your password for Spirit Love Play.
      Click the button below to create a new password:
    </p>
    <a href="${resetUrl}" class="button">Reset My Password</a>
    <p style="font-size: 14px; color: #666;">
      This link will expire in 1 hour for security.
    </p>
    <div class="footer">
      <p>If you didn't request this reset, you can safely ignore this email.</p>
      <p style="font-size: 12px; margin-top: 20px;">
        Or copy and paste this link:<br>
        <span style="color: #ec4899; word-break: break-all;">${resetUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email content
 */
function generateResetEmailText(name: string, resetUrl: string): string {
  return `
Password Reset Request - Spirit Love Play

Hi ${name},

We received a request to reset your password for Spirit Love Play.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour for security.

If you didn't request this reset, you can safely ignore this email.

---
Spirit Love Play
  `.trim();
}
