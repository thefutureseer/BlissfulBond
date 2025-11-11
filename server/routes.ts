import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment } from "./sentiment";
import { insertMomentSchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create user by name
  app.post("/api/users/:name", async (req, res) => {
    try {
      const { name } = req.params;
      
      let user = await storage.getUserByName(name);
      if (!user) {
        user = await storage.createUser({ name });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get moments for a user
  app.get("/api/users/:userId/moments", async (req, res) => {
    try {
      const { userId } = req.params;
      const moments = await storage.getMomentsByUser(userId);
      res.json(moments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new moment with sentiment analysis
  app.post("/api/moments", async (req, res) => {
    try {
      const data = insertMomentSchema.parse(req.body);
      
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

  // Get tasks for a user
  app.get("/api/users/:userId/tasks", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateTask(id, req.body);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
