/**
 * Email service for sending password reset magic links
 * 
 * For development: Logs email to console
 * For production: Configure with a transactional email provider
 * (e.g., Resend, Mailgun, SendGrid)
 */

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send password reset email with magic link
 */
export async function sendPasswordResetEmail(
  recipientName: string,
  resetToken: string
): Promise<void> {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000";
  
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const emailConfig: EmailConfig = {
    to: recipientName,
    subject: "Password Reset - Spirit Love Play",
    html: generateResetEmailHTML(recipientName, resetUrl),
    text: generateResetEmailText(recipientName, resetUrl),
  };

  if (process.env.NODE_ENV === "production" && process.env.EMAIL_API_KEY) {
    await sendViaEmailProvider(emailConfig);
  } else {
    logEmailToConsole(emailConfig);
  }
}

/**
 * Log email to console (development mode)
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
 * Send via email provider (production mode)
 * To implement: Add your preferred email service (Resend, Mailgun, etc.)
 */
async function sendViaEmailProvider(config: EmailConfig): Promise<void> {
  // TODO: Implement with actual email provider when ready
  // Example with Resend:
  // const resend = new Resend(process.env.EMAIL_API_KEY);
  // await resend.emails.send({
  //   from: 'Spirit Love Play <noreply@yourdomain.com>',
  //   to: config.to,
  //   subject: config.subject,
  //   html: config.html,
  // });
  
  console.log("Email provider not configured, logging to console instead:");
  logEmailToConsole(config);
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
