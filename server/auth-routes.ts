import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  authenticateUser,
  setUserPassword,
  userHasPassword,
  verifyUserPassword,
  type AuthUser,
} from "./auth.js";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  name: z.enum(["daniel", "pacharee"]),
  password: z.string().min(1),
});

const setupPasswordSchema = z.object({
  userId: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { name, password } = loginSchema.parse(req.body);

    const user = await authenticateUser(name, password);
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Session error" });
      }

      // Create new session with user data
      req.session.userId = user.id;
      req.session.userName = user.name;

      res.json({ 
        user: {
          id: user.id,
          name: user.name,
        }
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/logout
 * Destroy session
 */
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      hasPassword: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, req.session.userId))
    .limit(1);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      needsPasswordSetup: !user.hasPassword,
    },
  });
});

/**
 * POST /api/auth/setup-password
 * Set initial password for user (first-time setup)
 */
router.post("/setup-password", async (req: Request, res: Response) => {
  try {
    const { userId, password } = setupPasswordSchema.parse(req.body);

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password already set (prevent account takeover)
    if (user.passwordHash) {
      return res.status(400).json({ 
        message: "Password already set. Use change password instead." 
      });
    }

    await setUserPassword(userId, password);

    // Regenerate session and auto-login after setup
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Session error" });
      }

      req.session.userId = user.id;
      req.session.userName = user.name;

      res.json({ 
        message: "Password set successfully",
        user: {
          id: user.id,
          name: user.name,
        }
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Verify current password
    const isValid = await verifyUserPassword(req.session.userId, currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Set new password
    await setUserPassword(req.session.userId, newPassword);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/auth/check-setup/:name
 * Check if user needs password setup
 */
router.get("/check-setup/:name", async (req: Request, res: Response) => {
  const name = req.params.name;

  if (name !== "daniel" && name !== "pacharee") {
    return res.status(400).json({ message: "Invalid user name" });
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      hasPassword: users.passwordHash,
    })
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    userId: user.id,
    needsSetup: !user.hasPassword,
  });
});

export default router;
