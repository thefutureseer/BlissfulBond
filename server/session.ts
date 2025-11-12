import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";

const PgSession = ConnectPgSimple(session);

// Create secure session store using PostgreSQL
// Sessions persist across server restarts and are cryptographically signed
export const sessionStore = new PgSession({
  pool,
  tableName: "user_sessions",
  createTableIfMissing: true,
});

// Session middleware with security settings
export const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "spirit-love-play-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax", // CSRF protection
  },
  name: "slp.sid", // Custom session ID name
});

// Extend Express Session type to include our user data
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userName?: string;
  }
}
