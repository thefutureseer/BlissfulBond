import { apiRequest } from "./queryClient";

export type User = "daniel" | "pacharee";

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

export interface UserData {
  id: string;
  name: string;
  createdAt: string;
}

// Map user names to backend format
const userNameMap: Record<User, string> = {
  daniel: "daniel",
  pacharee: "pacharee",
};

let userCache: Record<string, UserData> = {};

export async function getOrCreateUser(user: User): Promise<UserData> {
  const name = userNameMap[user];
  
  if (userCache[name]) {
    return userCache[name];
  }

  const response = await apiRequest("POST", `/api/users/${name}`);
  const data = await response.json();
  
  userCache[name] = data;
  return data;
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

// Keep localStorage utility for current user preference
const CURRENT_USER_KEY = "spiritLoveCurrentUser";

export function getCurrentUser(): User {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  return (saved as User) || "daniel";
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, user);
}
