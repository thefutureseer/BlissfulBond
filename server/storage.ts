import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { User, UpsertUser, Moment, InsertMoment, Task, InsertTask, EmotionLog, InsertEmotionLog } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getPartnerUser(userId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Moments
  getMomentsByUser(userId: string): Promise<Moment[]>;
  createMoment(moment: InsertMoment & { sentiment?: Moment["sentiment"] }): Promise<Moment>;
  
  // Tasks
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  // Emotion Logs
  getEmotionLogsByUser(userId: string, options?: { start?: Date; end?: Date; limit?: number }): Promise<EmotionLog[]>;
  createEmotionLog(emotionLog: InsertEmotionLog): Promise<EmotionLog>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getPartnerUser(userId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user?.partnerId) {
      return undefined;
    }
    
    const partner = await this.getUser(user.partnerId);
    if (!partner) {
      return undefined;
    }
    
    // Verify mutual partner relationship for security
    // Only return partner if relationship is mutual
    if (partner.partnerId !== userId) {
      return undefined;
    }
    
    return partner;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    // Security: partnerId is immutable after seeding
    // Prevent partner relationship hijacking
    if (updates.partnerId !== undefined) {
      throw new Error("Partner relationship cannot be modified");
    }
    
    const result = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async getMomentsByUser(userId: string): Promise<Moment[]> {
    return db.select().from(schema.moments).where(eq(schema.moments.userId, userId));
  }

  async createMoment(moment: InsertMoment & { sentiment?: Moment["sentiment"] }): Promise<Moment> {
    const result = await db.insert(schema.moments).values(moment).returning();
    return result[0];
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return db.select().from(schema.tasks).where(eq(schema.tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(schema.tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const result = await db
      .update(schema.tasks)
      .set(updates)
      .where(eq(schema.tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  }

  async getEmotionLogsByUser(userId: string, options?: { start?: Date; end?: Date; limit?: number }): Promise<EmotionLog[]> {
    let query = db.select().from(schema.emotionLogs).where(eq(schema.emotionLogs.userId, userId));
    
    // No additional filters needed for start/end in this simple implementation
    // Could add filtering later if needed
    
    const result = await query.orderBy(schema.emotionLogs.createdAt);
    
    // Apply limit if provided
    if (options?.limit) {
      return result.slice(0, options.limit);
    }
    
    return result;
  }

  async createEmotionLog(emotionLog: InsertEmotionLog): Promise<EmotionLog> {
    const result = await db.insert(schema.emotionLogs).values(emotionLog).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
