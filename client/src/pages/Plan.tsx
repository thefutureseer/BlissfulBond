import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TaskCard from "@/components/TaskCard";
import { getOrCreateUser, getUserTasks, createTask, updateTask, deleteTask as apiDeleteTask, getCurrentUser } from "@/lib/api";
import Confetti from "@/components/Confetti";

const CATEGORIES = [
  { name: "Romance", emoji: "💃", color: "from-rose-400/20 to-pink-300/20" },
  { name: "Wellness", emoji: "🌅", color: "from-amber-400/20 to-orange-300/20" },
  { name: "Growth", emoji: "🌱", color: "from-green-400/20 to-emerald-300/20" },
  { name: "Fun", emoji: "🎠", color: "from-purple-400/20 to-pink-300/20" },
];

export default function Plan() {
  const [, setLocation] = useLocation();
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const queryClient = useQueryClient();
  
  const currentUser = getCurrentUser();

  const { data: userData } = useQuery({
    queryKey: ["/api/users", currentUser],
    queryFn: () => getOrCreateUser(currentUser),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", userData?.id],
    queryFn: () => userData ? getUserTasks(userData.id) : [],
    enabled: !!userData,
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({ text, category }: { text: string; category: string }) => {
      if (!userData) throw new Error("User not loaded");
      return createTask(userData.id, text, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", userData?.id] });
      setShowConfetti(true);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, { completed }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", userData?.id] });
      if (variables.completed) {
        setShowConfetti(true);
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: apiDeleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", userData?.id] });
    },
  });

  const handleAddTask = (category: string) => {
    const text = newTaskText[category]?.trim();
    if (!text) return;

    createTaskMutation.mutate({ text, category });
    setNewTaskText({ ...newTaskText, [category]: "" });
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTaskMutation.mutate({ id, completed: !task.completed });
    }
  };

  const handleDelete = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-script font-bold text-primary">
            Our Plan Together
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category, index) => {
            const categoryTasks = tasks.filter(
              (t) => t.category === category.name
            );

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${category.color} rounded-lg p-6 border`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">{category.emoji}</span>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                </div>

                <div className="space-y-3 mb-4">
                  {categoryTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 text-sm italic">
                      No tasks yet
                    </p>
                  ) : (
                    categoryTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskText[category.name] || ""}
                    onChange={(e) =>
                      setNewTaskText({
                        ...newTaskText,
                        [category.name]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTask(category.name);
                      }
                    }}
                    data-testid={`input-task-${category.name.toLowerCase()}`}
                  />
                  <Button
                    size="icon"
                    onClick={() => handleAddTask(category.name)}
                    disabled={!newTaskText[category.name]?.trim()}
                    data-testid={`button-add-task-${category.name.toLowerCase()}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/settings")}
            data-testid="button-go-to-settings"
          >
            Settings
          </Button>
        </div>
      </div>

      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}
