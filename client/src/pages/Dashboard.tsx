import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useLocation } from "wouter";
import MomentCard from "@/components/MomentCard";
import HeartProgress from "@/components/HeartProgress";
import { loadData, setCurrentUser } from "@/lib/localStorage";
import type { User } from "@/lib/localStorage";

type ViewMode = "both" | "daniel" | "pacharee";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [data, setData] = useState(loadData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(loadData());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const danielMoments = data.moments.filter((m) => m.user === "daniel");
  const pachareeMoments = data.moments.filter((m) => m.user === "pacharee");

  const handleAddMoment = (user: User) => {
    setCurrentUser(user);
    setLocation("/entry");
  };

  const cycleView = () => {
    setViewMode((current) => {
      if (current === "both") return "daniel";
      if (current === "daniel") return "pacharee";
      return "both";
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-script font-bold text-primary">
            Spirit Love Play
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={cycleView}
            data-testid="button-toggle-view"
          >
            <Eye className="w-4 h-4 mr-2" />
            {viewMode === "both" ? "Both" : viewMode === "daniel" ? "Daniel" : "Pacharee"}
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div
          className={`grid gap-6 ${viewMode === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"}`}
        >
          {(viewMode === "both" || viewMode === "daniel") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-rose-400/10 to-pink-200/10 rounded-lg p-6 border border-primary/20">
                <h2 className="text-xl font-script font-semibold text-primary mb-4">
                  Daniel's Journal
                </h2>
                
                <HeartProgress
                  value={danielMoments.length}
                  max={20}
                  label="Moments"
                />

                <div className="mt-6 space-y-3">
                  {danielMoments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm italic">
                      No moments yet. Start your journey!
                    </p>
                  ) : (
                    danielMoments.map((moment) => (
                      <MomentCard key={moment.id} moment={moment} />
                    ))
                  )}
                </div>

                <Button
                  onClick={() => handleAddMoment("daniel")}
                  className="w-full mt-4"
                  data-testid="button-add-moment-daniel"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Moment
                </Button>
              </div>
            </motion.div>
          )}

          {(viewMode === "both" || viewMode === "pacharee") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-amber-300/10 to-pink-200/10 rounded-lg p-6 border border-secondary/20">
                <h2 className="text-xl font-script font-semibold text-secondary mb-4">
                  Pacharee's Journal
                </h2>
                
                <HeartProgress
                  value={pachareeMoments.length}
                  max={20}
                  label="Moments"
                />

                <div className="mt-6 space-y-3">
                  {pachareeMoments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm italic">
                      No moments yet. Start your journey!
                    </p>
                  ) : (
                    pachareeMoments.map((moment) => (
                      <MomentCard key={moment.id} moment={moment} />
                    ))
                  )}
                </div>

                <Button
                  onClick={() => handleAddMoment("pacharee")}
                  className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  data-testid="button-add-moment-pacharee"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Moment
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/plan")}
            data-testid="button-go-to-plan"
          >
            View Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
