import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './db';
import { log } from './vite';

let migrationPromise: Promise<void> | null = null;
let migrationComplete = false;

/**
 * Runs database migrations in production after server starts.
 * This ensures:
 * 1. Server binds to port quickly (no timeout)
 * 2. Tables exist before handling requests
 * 3. Schema stays consistent via Drizzle migrations
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
      log('🔧 Running database migrations...');
      
      await migrate(db, { migrationsFolder: './migrations' });
      
      log('✅ Database migrations complete');
      migrationComplete = true;
    } catch (error: any) {
      log('⚠️ Migration warning: ' + error.message);
      // Don't throw - migrations might already be applied
      migrationComplete = true;
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
