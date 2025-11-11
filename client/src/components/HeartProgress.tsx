import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface HeartProgressProps {
  value: number;
  max: number;
  label?: string;
}

export default function HeartProgress({ value, max, label }: HeartProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2" data-testid="progress-heart">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-4 -translate-y-1/2"
        >
          <Heart className="w-5 h-5 text-white fill-white" />
        </motion.div>
      </div>
    </div>
  );
}
