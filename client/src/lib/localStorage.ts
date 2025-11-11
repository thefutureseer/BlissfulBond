export type User = "daniel" | "pacharee";

export interface Moment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  user: User;
  text: string;
  category: string;
  completed: boolean;
}

export interface AppData {
  moments: Moment[];
  tasks: Task[];
  currentUser: User;
}

const STORAGE_KEY = "spiritLoveData";

const defaultData: AppData = {
  moments: [],
  tasks: [],
  currentUser: "daniel",
};

export function loadData(): AppData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultData;
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}

export function addMoment(moment: Omit<Moment, "id" | "createdAt">): Moment {
  const data = loadData();
  const newMoment: Moment = {
    ...moment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.moments.push(newMoment);
  saveData(data);
  return newMoment;
}

export function addTask(task: Omit<Task, "id" | "completed">): Task {
  const data = loadData();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    completed: false,
  };
  data.tasks.push(newTask);
  saveData(data);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const data = loadData();
  const index = data.tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    data.tasks[index] = { ...data.tasks[index], ...updates };
    saveData(data);
  }
}

export function deleteTask(id: string): void {
  const data = loadData();
  data.tasks = data.tasks.filter((t) => t.id !== id);
  saveData(data);
}

export function setCurrentUser(user: User): void {
  const data = loadData();
  data.currentUser = user;
  saveData(data);
}

export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
