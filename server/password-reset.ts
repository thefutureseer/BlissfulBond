import crypto from "crypto";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.js";

const TOKEN_EXPIRY_HOURS = 1;
const TOKEN_LENGTH_BYTES = 32;

/**
 * Generate a cryptographically secure random token
 * Returns the raw token (to send) and its hash (to store)
 */
function generateToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(TOKEN_LENGTH_BYTES).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  
  return { rawToken, tokenHash };
}

/**
 * Hash a token for comparison (used when validating)
 */
function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Create a password reset token for a user
 * Returns the raw token to send via email
 * Invalidates any previous reset tokens for this user
 */
export async function createPasswordResetToken(
  userName: string
): Promise<string | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.name, userName))
    .limit(1);

  if (!user) {
    return null;
  }

  const { rawToken, tokenHash } = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  await db
    .update(users)
    .set({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
      resetTokenIssuedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return rawToken;
}

/**
 * Validate a reset token and return the user if valid
 * Checks: token exists, not expired, matches stored hash
 */
export async function validateResetToken(
  token: string
): Promise<{ userId: string; userName: string } | null> {
  const tokenHash = hashToken(token);

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      resetTokenHash: users.resetTokenHash,
      resetTokenExpiresAt: users.resetTokenExpiresAt,
    })
    .from(users)
    .where(eq(users.resetTokenHash, tokenHash))
    .limit(1);

  if (!user || !user.resetTokenExpiresAt) {
    return null;
  }

  if (new Date() > user.resetTokenExpiresAt) {
    return null;
  }

  return {
    userId: user.id,
    userName: user.name,
  };
}

/**
 * Complete password reset: validate token and update password
 * Clears reset token fields after successful reset
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; userId?: string }> {
  const validUser = await validateResetToken(token);
  
  if (!validUser) {
    return { success: false };
  }

  const newPasswordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      passwordUpdatedAt: new Date(),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      resetTokenIssuedAt: null,
    })
    .where(eq(users.id, validUser.userId));

  return {
    success: true,
    userId: validUser.userId,
  };
}

/**
 * Clear reset token for a user (cleanup on error or expiry)
 */
export async function clearResetToken(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      resetTokenIssuedAt: null,
    })
    .where(eq(users.id, userId));
}
