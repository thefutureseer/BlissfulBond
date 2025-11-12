import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Heart, Sparkles, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getOrCreateUser, getUserMoments, getUserEmotionLogs, type User } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, Bar, Legend } from "recharts";

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [selectedUser, setSelectedUser] = useState<User>("daniel");

  const { data: userData } = useQuery({
    queryKey: ["/api/users", selectedUser],
    queryFn: () => getOrCreateUser(selectedUser),
  });

  const { data: moments = [] } = useQuery({
    queryKey: ["/api/moments", userData?.id],
    queryFn: () => userData ? getUserMoments(userData.id) : [],
    enabled: !!userData,
  });

  const { data: emotionLogs = [] } = useQuery({
    queryKey: ["/api/emotions", userData?.id],
    queryFn: () => userData ? getUserEmotionLogs(userData.id) : [],
    enabled: !!userData,
  });

  // Prepare sentiment trend data
  const trendData = moments
    .filter(m => m.sentiment)
    .slice(-10)
    .map((m, i) => ({
      index: i + 1,
      score: m.sentiment!.score,
      date: new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  // Prepare emotion distribution
  const emotionCounts: Record<string, number> = {};
  moments.forEach(m => {
    m.sentiment?.emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  const emotionData = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ["#fb7185", "#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

  const avgSentiment = moments.length > 0
    ? moments.reduce((sum, m) => sum + (m.sentiment?.score || 0), 0) / moments.length
    : 0;

  const positiveCount = moments.filter(m => (m.sentiment?.score || 0) > 0.2).length;
  const neutralCount = moments.filter(m => {
    const score = m.sentiment?.score || 0;
    return score >= -0.2 && score <= 0.2;
  }).length;
  const negativeCount = moments.filter(m => (m.sentiment?.score || 0) < -0.2).length;

  // Prepare emotion intensity trend data (last 10 entries)
  const emotionTrendData = emotionLogs
    .slice(-10)
    .map((log, i) => ({
      index: i + 1,
      intensity: log.intensity,
      emotion: log.emotion,
      date: new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  // Calculate average emotion intensity
  const avgEmotionIntensity = emotionLogs.length > 0
    ? emotionLogs.reduce((sum, log) => sum + log.intensity, 0) / emotionLogs.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-script font-bold text-primary">
              Relationship Analytics
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedUser === "daniel" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUser("daniel")}
              data-testid="button-select-daniel"
            >
              Daniel
            </Button>
            <Button
              variant={selectedUser === "pacharee" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUser("pacharee")}
              className={selectedUser === "pacharee" ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}
              data-testid="button-select-pacharee"
            >
              Pacharee
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-8 space-y-6">
        {moments.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No moments yet for {selectedUser}. Start journaling to see analytics!
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-gradient-to-br from-rose-400/10 to-pink-200/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Sentiment</p>
                      <p className="text-3xl font-bold mt-2">
                        {(avgSentiment * 100).toFixed(0)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-amber-300/10 to-pink-200/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Moments</p>
                      <p className="text-3xl font-bold mt-2">{moments.length}</p>
                    </div>
                    <Heart className="w-8 h-8 text-secondary fill-secondary" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-400/10 to-pink-200/10">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Mood Distribution</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Positive</span>
                        <span className="font-semibold">{positiveCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Neutral</span>
                        <span className="font-semibold">{neutralCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Negative</span>
                        <span className="font-semibold">{negativeCount}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {trendData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Sentiment Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#fb7185"
                        strokeWidth={2}
                        dot={{ fill: "#fb7185", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}

            {emotionData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Emotions</h3>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={emotionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {emotionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            )}

            {emotionTrendData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Emotion Intensity Trend</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      <span>Avg: {avgEmotionIntensity.toFixed(1)}/10</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={emotionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border rounded-lg p-3 shadow-lg">
                                <p className="text-sm font-semibold">{payload[0].payload.emotion}</p>
                                <p className="text-sm text-muted-foreground">
                                  Intensity: {payload[0].value}/10
                                </p>
                                <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="intensity"
                        stroke="#a78bfa"
                        strokeWidth={3}
                        dot={{ fill: "#a78bfa", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
