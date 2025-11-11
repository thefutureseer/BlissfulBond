import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Heart, ArrowLeft } from "lucide-react";
import { addMoment, loadData } from "@/lib/localStorage";
import Confetti from "@/components/Confetti";

export default function Entry() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const currentUser = loadData().currentUser;

  const handleSave = () => {
    if (!content.trim()) return;

    addMoment({
      user: currentUser,
      content: content.trim(),
    });

    setShowSuccess(true);
    setShowConfetti(true);

    setTimeout(() => {
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-script font-bold text-primary">
            New Moment
          </h1>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 py-8"
      >
        <div className="bg-gradient-to-br from-rose-400/5 to-amber-300/5 rounded-lg p-6 border border-primary/10 space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Writing as</p>
              <p className="font-script text-lg font-semibold capitalize text-primary">
                {currentUser}
              </p>
            </div>
          </div>

          <div>
            <Textarea
              placeholder="Write what made your heart smile today…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none text-base"
              data-testid="input-moment-content"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{new Date().toLocaleDateString("en-US", { 
              month: "long", 
              day: "numeric", 
              year: "numeric" 
            })}</span>
            <span>{new Date().toLocaleTimeString("en-US", { 
              hour: "numeric", 
              minute: "2-digit" 
            })}</span>
          </div>

          <Button
            onClick={handleSave}
            disabled={!content.trim()}
            className="w-full"
            data-testid="button-save-moment"
          >
            <Heart className="w-4 h-4 mr-2" />
            Save with Love
          </Button>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary font-script text-lg"
            >
              Saved with love 💖
            </motion.div>
          )}
        </div>
      </motion.div>

      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}
