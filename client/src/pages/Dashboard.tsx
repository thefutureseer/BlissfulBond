import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BarChart3, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MomentCard from "@/components/MomentCard";
import HeartProgress from "@/components/HeartProgress";
import { getUserMoments, getPartnerUser } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch partner user
  const { data: partner } = useQuery({
    queryKey: ["/api/users/partner", user?.id],
    queryFn: () => user ? getPartnerUser(user.id) : null,
    enabled: !!user,
  });

  // Fetch authenticated user's moments
  const { data: userMoments = [] } = useQuery({
    queryKey: ["/api/moments", user?.id],
    queryFn: () => user ? getUserMoments(user.id) : [],
    enabled: !!user,
  });

  // Fetch partner's moments
  const { data: partnerMoments = [] } = useQuery({
    queryKey: ["/api/moments", partner?.id],
    queryFn: () => partner ? getUserMoments(partner.id) : [],
    enabled: !!partner,
  });

  const handleAddMoment = () => {
    setLocation("/entry");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  const userName = user?.firstName || "Your";
  const partnerName = partner?.firstName || "Partner's";
  const hasPartner = !!partner;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-script font-bold text-primary">
            Spirit Love Play
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/analytics")}
              data-testid="button-go-to-analytics"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className={`grid gap-6 ${hasPartner ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"}`}>
          {/* Authenticated User's Column */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-rose-400/10 to-pink-200/10 rounded-lg p-6 border border-primary/20">
                <h2 className="text-xl font-script font-semibold text-primary mb-4">
                  {userName} Journal
                </h2>
                
                <HeartProgress
                  value={userMoments.length}
                  max={20}
                  label="Moments"
                />

                <div className="mt-6 space-y-3">
                  {userMoments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm italic">
                      No moments yet. Start your journey!
                    </p>
                  ) : (
                    userMoments.map((moment) => (
                      <MomentCard key={moment.id} moment={moment} />
                    ))
                  )}
                </div>

                <Button
                  onClick={handleAddMoment}
                  className="w-full mt-4"
                  data-testid="button-add-moment-user"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Moment
                </Button>
              </div>
            </motion.div>
          )}

          {/* Partner's Column */}
          {hasPartner && partner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-amber-300/10 to-pink-200/10 rounded-lg p-6 border border-secondary/20">
                <h2 className="text-xl font-script font-semibold text-secondary mb-4">
                  {partnerName} Journal
                </h2>
                
                <HeartProgress
                  value={partnerMoments.length}
                  max={20}
                  label="Moments"
                />

                <div className="mt-6 space-y-3">
                  {partnerMoments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm italic">
                      No moments yet.
                    </p>
                  ) : (
                    partnerMoments.map((moment) => (
                      <MomentCard key={moment.id} moment={moment} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* No Partner Message */}
          {!hasPartner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No partner linked yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Partner linking coming soon!
                </p>
              </Card>
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
