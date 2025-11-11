import { useState } from "react";
import TaskCard from "../TaskCard";

export default function TaskCardExample() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      user: "daniel" as const,
      text: "Plan a romantic dinner together",
      category: "Romance",
      completed: false,
    },
    {
      id: "2",
      user: "pacharee" as const,
      text: "Morning meditation session",
      category: "Wellness",
      completed: true,
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
