import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment } from "./sentiment";
import { insertMomentSchema, insertTaskSchema, insertEmotionLogSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth.js";
import { z } from "zod";

// Helper to get user ID from Replit Auth session
function getUserId(req: Request): string {
  const user = req.user as any;
  return user?.claims?.sub;
}

// Helper function to check if two users are partners in this couple's app
async function arePartners(userId1: string, userId2: string): Promise<boolean> {
  // Get both users
  const user1 = await storage.getUser(userId1);
  const user2 = await storage.getUser(userId2);
  
  if (!user1 || !user2) return false;
  
  // Check if they have partner IDs set and they mutually reference each other
  // This is the ONLY way to establish a partner relationship (no auto-linking)
  return user1.partnerId === userId2 && user2.partnerId === userId1;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth (handles sessions, login, logout, callback)
  await setupAuth(app);

  // Get current user endpoint
  app.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get moments for a user (protected)
  app.get("/api/users/:userId/moments", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const sessionUserId = getUserId(req);
      
      // Allow access if requesting own data OR if requesting partner's data
      const isOwnData = userId === sessionUserId;
      const isPartnerData = await arePartners(sessionUserId, userId);
      
      if (!isOwnData && !isPartnerData) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const moments = await storage.getMomentsByUser(userId);
      res.json(moments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new moment with sentiment analysis (protected)
  app.post("/api/moments", isAuthenticated, async (req, res) => {
    try {
      const data = insertMomentSchema.parse(req.body);
      
      // Authorization check: user can only create moments for themselves
      if (data.userId !== getUserId(req)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Analyze sentiment
      const sentiment = await analyzeSentiment(data.content);
      
      const moment = await storage.createMoment({
        ...data,
        sentiment,
      });
      
      res.json(moment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get tasks for a user (protected)
  app.get("/api/users/:userId/tasks", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const sessionUserId = getUserId(req);
      
      // Allow access if requesting own data OR if requesting partner's data
      const isOwnData = userId === sessionUserId;
      const isPartnerData = await arePartners(sessionUserId, userId);
      
      if (!isOwnData && !isPartnerData) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new task (protected)
  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      
      // Authorization check: user can only create tasks for themselves
      if (data.userId !== getUserId(req)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const task = await storage.createTask(data);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a task (protected)
  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // First get the task to verify ownership
      const tasks = await storage.getTasksByUser(getUserId(req));
      const existingTask = tasks.find(t => t.id === id);
      
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found or access denied" });
      }
      
      // Validate and sanitize update data - only allow safe fields
      const updateSchema = z.object({
        text: z.string().optional(),
        category: z.string().optional(),
        completed: z.boolean().optional(),
      });
      
      const safeUpdates = updateSchema.parse(req.body);
      const task = await storage.updateTask(id, safeUpdates);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a task (protected)
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // First get the task to verify ownership
      const tasks = await storage.getTasksByUser(getUserId(req));
      const existingTask = tasks.find(t => t.id === id);
      
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found or access denied" });
      }
      
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create emotion log (protected)
  app.post("/api/emotions", isAuthenticated, async (req, res) => {
    try {
      const data = insertEmotionLogSchema.parse(req.body);
      
      // Authorization check: user can only create emotion logs for themselves
      if (data.userId !== getUserId(req)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const emotionLog = await storage.createEmotionLog(data);
      res.json(emotionLog);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
