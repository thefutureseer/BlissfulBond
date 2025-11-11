import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import type { Task } from "@/lib/api";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      data-testid={`card-task-${task.id}`}
    >
      <Card className="p-3 hover-elevate">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
            data-testid={`checkbox-task-${task.id}`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.text}
            </p>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(task.id)}
                className="h-8 w-8"
                data-testid={`button-edit-task-${task.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              data-testid={`button-delete-task-${task.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
