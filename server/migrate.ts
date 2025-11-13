import { sql } from 'drizzle-orm';
import { db } from './db';
import { log } from './vite';
import * as schema from '@shared/schema';

let migrationPromise: Promise<void> | null = null;
let migrationComplete = false;

/**
 * Ensures database tables exist in production after server starts.
 * This ensures:
 * 1. Server binds to port quickly (no timeout)
 * 2. Tables exist before handling requests
 * 3. Schema stays consistent via CREATE IF NOT EXISTS
 */
export async function runMigrations(): Promise<void> {
  // Return immediately if already done
  if (migrationComplete) {
    return;
  }

  // If migration is in progress, wait for it
  if (migrationPromise) {
    return migrationPromise;
  }

  // Start migration
  migrationPromise = (async () => {
    try {
      log('🔧 Setting up database schema...');
      
      // Create tables using raw SQL - safe CREATE IF NOT EXISTS
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR NOT NULL UNIQUE,
          first_name VARCHAR,
          last_name VARCHAR,
          profile_image_url VARCHAR,
          partner_id VARCHAR REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSON NOT NULL,
          expire TIMESTAMP NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

        CREATE TABLE IF NOT EXISTS moments (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          sentiment_score REAL,
          sentiment_label VARCHAR,
          emotions TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR NOT NULL REFERENCES users(id),
          title VARCHAR NOT NULL,
          category VARCHAR NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS emotion_logs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR NOT NULL REFERENCES users(id),
          emotion VARCHAR NOT NULL,
          intensity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      log('✅ Database schema ready');
      migrationComplete = true;
    } catch (error: any) {
      log('❌ Schema setup error: ' + error.message);
      // Still mark as complete to avoid blocking requests indefinitely
      migrationComplete = true;
      throw error;
    }
  })();

  return migrationPromise;
}

/**
 * Middleware to ensure migrations run before processing requests
 */
export async function ensureMigrationsComplete(_req: any, res: any, next: any) {
  if (migrationComplete) {
    return next();
  }

  try {
    await runMigrations();
    next();
  } catch (error: any) {
    res.status(503).json({ 
      message: 'Service temporarily unavailable - database initializing',
      error: error.message 
    });
  }
}
