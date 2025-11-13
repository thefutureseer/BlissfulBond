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
      
      // Check database connection first
      try {
        await db.execute(sql`SELECT 1`);
        log('✅ Database connection successful');
      } catch (dbError: any) {
        log('❌ Database connection failed: ' + dbError.message);
        throw new Error('Cannot connect to database: ' + dbError.message);
      }
      
      // Create tables using raw SQL - safe CREATE IF NOT EXISTS
      log('Creating users table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR UNIQUE,
          first_name VARCHAR,
          last_name VARCHAR,
          profile_image_url VARCHAR,
          partner_id VARCHAR REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      log('Creating sessions table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
      `);
      
      log('Creating moments table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS moments (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          sentiment JSON,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      log('Creating tasks table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          text TEXT NOT NULL,
          category TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      log('Creating emotion_logs table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS emotion_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          emotion TEXT NOT NULL,
          intensity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      log('✅ Database schema ready');
      migrationComplete = true;
    } catch (error: any) {
      console.error('❌ MIGRATION ERROR:', error);
      log('❌ Schema setup error: ' + error.message);
      log('❌ Full error: ' + JSON.stringify(error, null, 2));
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
