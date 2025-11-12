import bcrypt from "bcrypt";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

// High security: bcrypt cost factor 12 (2^12 = 4096 rounds)
// Each increment doubles the time, making brute force exponentially harder
const BCRYPT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  name: string;
}

/**
 * Hash password with bcrypt using high cost factor for maximum security
 * Cost factor 12 = ~250ms per hash on modern hardware
 * Protects against rainbow tables and brute force attacks
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against stored hash using constant-time comparison
 * Protects against timing attacks
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate user by name and password
 * Returns user data if credentials valid, null otherwise
 */
export async function authenticateUser(
  name: string,
  password: string
): Promise<AuthUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  if (!user || !user.passwordHash) {
    // User doesn't exist or hasn't set up password
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
  };
}

/**
 * Set password for user (initial setup or change)
 */
export async function setUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const hash = await hashPassword(newPassword);
  
  await db
    .update(users)
    .set({
      passwordHash: hash,
      passwordUpdatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Check if user has password set up
 */
export async function userHasPassword(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return !!(user && user.passwordHash);
}

/**
 * Verify user's current password before allowing changes
 */
export async function verifyUserPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.passwordHash) {
    return false;
  }

  return verifyPassword(password, user.passwordHash);
}
