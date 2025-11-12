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
import { users, signupSchema } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import {
  createPasswordResetToken,
  validateResetToken,
  resetPasswordWithToken,
} from "./password-reset.js";
import { sendPasswordResetEmail } from "./email-service.js";
import bcrypt from "bcrypt";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  name: z.string().min(1),
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

const requestResetSchema = z.object({
  email: z.string().email(),
});

const validateTokenSchema = z.object({
  token: z.string().min(1),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    
    const normalizedEmail = email.toLowerCase().trim();

    const existingName = await db
      .select()
      .from(users)
      .where(eq(users.name, name))
      .limit(1);

    if (existingName.length > 0) {
      return res.status(400).json({ message: "Name already taken" });
    }

    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: normalizedEmail,
        passwordHash,
        passwordUpdatedAt: new Date(),
      })
      .returning();

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Session error" });
      }

      req.session.userId = newUser.id;
      req.session.userName = newUser.name;

      res.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request",
        errors: error.errors,
      });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/auth/users
 * Get all users (for login page display)
 */
router.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json({ users: allUsers });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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

/**
 * POST /api/auth/password-reset/request
 * Request a password reset email with magic link
 * Returns generic success to prevent user enumeration
 */
router.post("/password-reset/request", async (req: Request, res: Response) => {
  try {
    const { email } = requestResetSchema.parse(req.body);
    
    const normalizedEmail = email.toLowerCase().trim();

    const resetToken = await createPasswordResetToken(normalizedEmail);
    
    if (resetToken) {
      await sendPasswordResetEmail(normalizedEmail, resetToken);
    }

    res.json({ 
      message: "If an account exists, a password reset email has been sent." 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: error.errors 
      });
    }
    console.error("Password reset request error:", error);
    res.json({ 
      message: "If an account exists, a password reset email has been sent." 
    });
  }
});

/**
 * POST /api/auth/password-reset/validate
 * Validate a reset token without consuming it
 * Used to check if token is valid before showing reset form
 */
router.post("/password-reset/validate", async (req: Request, res: Response) => {
  try {
    const { token } = validateTokenSchema.parse(req.body);

    const validUser = await validateResetToken(token);
    
    if (!validUser) {
      return res.status(400).json({ 
        message: "Invalid or expired reset link" 
      });
    }

    res.json({ 
      valid: true,
      userName: validUser.userName 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request",
        errors: error.errors 
      });
    }
    res.status(400).json({ 
      message: "Invalid or expired reset link" 
    });
  }
});

/**
 * POST /api/auth/password-reset/complete
 * Complete password reset with new password
 * Validates token, updates password, and creates session
 */
router.post("/password-reset/complete", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const result = await resetPasswordWithToken(token, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: "Invalid or expired reset link" 
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, result.userId!))
      .limit(1);

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Session error" });
      }

      req.session.userId = user.id;
      req.session.userName = user.name;

      res.json({ 
        message: "Password reset successful",
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
    console.error("Password reset complete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
