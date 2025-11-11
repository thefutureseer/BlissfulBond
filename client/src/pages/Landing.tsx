import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, Heart } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-200 to-amber-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-2xl"
      >
        <div className="space-y-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Sparkles className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          </motion.div>
          
          <h1
            className="text-6xl md:text-7xl font-script font-bold text-white drop-shadow-lg"
            data-testid="text-app-title"
          >
            Spirit Love Play
          </h1>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-8 h-8 text-rose-600 fill-rose-600 mx-auto" />
          </motion.div>
          
          <p className="text-xl md:text-2xl text-white/90 font-light italic">
            For Daniel & Pacharee — where love grows with every moment.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={() => setLocation("/dashboard")}
            className="bg-white text-rose-600 hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            data-testid="button-start-journey"
          >
            Start Journey
          </Button>
        </motion.div>

        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-white/60" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
