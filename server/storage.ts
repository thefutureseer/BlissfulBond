import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { User, InsertUser, Moment, InsertMoment, Task, InsertTask } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Moments
  getMomentsByUser(userId: string): Promise<Moment[]>;
  createMoment(moment: InsertMoment & { sentiment?: Moment["sentiment"] }): Promise<Moment>;
  
  // Tasks
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.name, name));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
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
}

export const storage = new DbStorage();
