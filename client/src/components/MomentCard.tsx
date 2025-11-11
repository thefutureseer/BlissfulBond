import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Moment } from "@/lib/localStorage";

interface MomentCardProps {
  moment: Moment;
}

export default function MomentCard({ moment }: MomentCardProps) {
  const date = new Date(moment.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid={`card-moment-${moment.id}`}
    >
      <Card className="p-4 hover-elevate">
        <div className="flex gap-3">
          <div className="mt-1">
            <Heart className="w-5 h-5 text-primary fill-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed">{moment.content}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
