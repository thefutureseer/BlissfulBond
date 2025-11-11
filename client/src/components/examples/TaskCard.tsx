import { useState } from "react";
import TaskCard from "../TaskCard";

export default function TaskCardExample() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      userId: "user1",
      text: "Plan a romantic dinner together",
      category: "Romance",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "user2",
      text: "Morning meditation session",
      category: "Wellness",
      completed: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    console.log("Task toggled:", id);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    console.log("Task deleted:", id);
  };

  return (
    <div className="p-8 max-w-md space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
