import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Heart, Sparkles, Sun, Smile, CloudRain, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Confetti from "@/components/Confetti";

const emotions = [
  {
    name: "Love",
    icon: Heart,
    color: "from-rose-400 to-pink-300",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    name: "Calm",
    icon: Sun,
    color: "from-blue-400 to-cyan-300",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    name: "Excited",
    icon: Sparkles,
    color: "from-amber-400 to-yellow-300",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    name: "Grateful",
    icon: Smile,
    color: "from-emerald-400 to-green-300",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
];

export default function EmotionCheckIn() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showNegative, setShowNegative] = useState(false);
  const [negativeIntensity, setNegativeIntensity] = useState([500]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const saveEmotionMutation = useMutation({
    mutationFn: async (data: { userId: string; emotion: string; intensity: number }) => {
      const response = await apiRequest("POST", "/api/emotions", data);
      return response.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      queryClient.invalidateQueries({ queryKey: ["/api/emotions"] });
      toast({
        title: "Vibe saved! 💖",
        description: "Your emotion has been logged beautifully",
      });
      setTimeout(() => {
        setLocation("/analytics");
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("Emotion save error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleEmotionSelect = (emotionName: string) => {
    setSelectedEmotion(emotionName);
    setShowNegative(false);
  };

  const handleNegativeClick = () => {
    setShowNegative(true);
    setSelectedEmotion("Negative");
  };

  const handleSaveVibe = () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your emotion",
        variant: "destructive",
      });
      return;
    }

    const intensity = showNegative ? negativeIntensity[0] : 800;
    saveEmotionMutation.mutate({
      userId: user.id,
      emotion: selectedEmotion || "",
      intensity,
    });
  };

  const canSave = selectedEmotion !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-200 to-amber-300 flex items-center justify-center p-4">
      <Confetti show={showConfetti} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white" />
          </motion.div>
          <h1 className="text-5xl font-script font-bold text-white mb-2">
            How are you feeling?
          </h1>
          <p className="text-white/90 text-lg">
            Share your vibe with the universe
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showNegative ? (
            <motion.div
              key="positive-emotions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6 mb-6"
            >
              {emotions.map((emotion, index) => {
                const Icon = emotion.icon;
                const isSelected = selectedEmotion === emotion.name;
                
                return (
                  <motion.div
                    key={emotion.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`p-8 cursor-pointer bg-gradient-to-br ${emotion.color} border-2 ${
                        isSelected ? "border-white" : "border-white/20"
                      } hover:border-white/40 transition-all ${
                        isSelected ? "ring-4 ring-white/50" : ""
                      }`}
                      onClick={() => handleEmotionSelect(emotion.name)}
                      data-testid={`button-emotion-${emotion.name.toLowerCase()}`}
                    >
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={isSelected ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                          className="w-20 h-20 mx-auto rounded-full bg-white/30 backdrop-blur flex items-center justify-center"
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-script font-bold text-white">
                          {emotion.name}
                        </h2>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white text-sm"
                          >
                            ✓ Selected
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="negative-emotion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6"
            >
              <Card className="p-8 bg-gradient-to-br from-gray-400 to-slate-300 border-2 border-white/20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                    <CloudRain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-script font-bold text-white">
                    Feeling Negative
                  </h2>
                  <div className="space-y-4">
                    <p className="text-white/90">
                      How intense? (1 = slightly, 1000 = very intense)
                    </p>
                    <div className="px-8">
                      <Slider
                        value={negativeIntensity}
                        onValueChange={setNegativeIntensity}
                        min={1}
                        max={1000}
                        step={1}
                        className="w-full"
                        data-testid="slider-negative-intensity"
                      />
                    </div>
                    <div className="text-4xl font-bold text-white">
                      {negativeIntensity[0]}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNegative(false);
                      setSelectedEmotion(null);
                    }}
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                    data-testid="button-back-to-emotions"
                  >
                    ← Back to emotions
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-4">
          {!showNegative && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleNegativeClick}
              className="bg-white/10 border-white/40 text-white hover:bg-white/20 backdrop-blur"
              data-testid="button-feeling-negative"
            >
              <CloudRain className="w-5 h-5 mr-2" />
              Feeling negative
            </Button>
          )}

          <Button
            size="lg"
            onClick={handleSaveVibe}
            disabled={!canSave || saveEmotionMutation.isPending}
            className="bg-white text-rose-600 hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            data-testid="button-save-vibe"
          >
            {saveEmotionMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving your vibe...
              </>
            ) : (
              "Save My Vibe"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
