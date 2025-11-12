import { apiRequest } from "./queryClient";

export interface Moment {
  id: string;
  userId: string;
  content: string;
  sentiment?: {
    score: number;
    label: string;
    emotions: string[];
  };
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

export async function getUserMoments(userId: string): Promise<Moment[]> {
  const response = await fetch(`/api/users/${userId}/moments`, {
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export interface EmotionLog {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  createdAt: string;
}

export async function getUserEmotionLogs(userId: string): Promise<EmotionLog[]> {
  const response = await fetch(`/api/users/${userId}/emotions`, {
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function createMoment(userId: string, content: string): Promise<Moment> {
  const response = await apiRequest("POST", "/api/moments", { userId, content });
  return response.json();
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`/api/users/${userId}/tasks`, {
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function createTask(userId: string, text: string, category: string): Promise<Task> {
  const response = await apiRequest("POST", "/api/tasks", { userId, text, category });
  return response.json();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
  return response.json();
}

export async function deleteTask(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/tasks/${id}`);
}
