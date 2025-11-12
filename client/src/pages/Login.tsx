import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Heart, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type User = "daniel" | "pacharee";

interface LoginResponse {
  user: {
    id: string;
    name: string;
  };
}

interface SetupResponse {
  userId: string;
  needsSetup: boolean;
}

export default function Login() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [userId, setUserId] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkSetupMutation = useMutation({
    mutationFn: async (name: User) => {
      const response = await fetch(`/api/auth/check-setup/${name}`);
      return response.json() as Promise<SetupResponse>;
    },
    onSuccess: (data) => {
      setIsSetupMode(data.needsSetup);
      setUserId(data.userId);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { name: User; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back! 💖",
        description: "Now share your vibe",
      });
      setTimeout(() => setLocation("/emotions"), 500);
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { userId: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/setup-password", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Password set! 💖",
        description: "Now share your vibe",
      });
      setTimeout(() => setLocation("/emotions"), 500);
    },
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPassword("");
    setConfirmPassword("");
    checkSetupMutation.mutate(user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    if (isSetupMode) {
      if (password.length < 8) {
        toast({
          title: "Password too short",
          description: "Password must be at least 8 characters",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please ensure both passwords are the same",
          variant: "destructive",
        });
        return;
      }

      setupMutation.mutate({ userId, password });
    } else {
      loginMutation.mutate({ name: selectedUser, password });
    }
  };

  const users: { name: User; color: string; gradient: string }[] = [
    {
      name: "daniel",
      color: "from-blue-400 to-cyan-300",
      gradient: "from-blue-400/10 to-cyan-300/10",
    },
    {
      name: "pacharee",
      color: "from-rose-400 to-pink-300",
      gradient: "from-rose-400/10 to-pink-300/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-200 to-amber-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-12 h-12 mx-auto mb-4 text-white fill-white" />
          </motion.div>
          <h1 className="text-5xl font-script font-bold text-white mb-2">
            Spirit Love Play
          </h1>
          <p className="text-white/90 text-lg">
            Lovingly login to our sanctuary
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {users.map((user) => (
                <motion.div
                  key={user.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`p-8 cursor-pointer bg-gradient-to-br ${user.gradient} border-2 border-white/20 hover:border-white/40 transition-all`}
                    onClick={() => handleUserSelect(user.name)}
                    data-testid={`button-select-${user.name}`}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center`}>
                        <Heart className="w-10 h-10 text-white fill-white" />
                      </div>
                      <h2 className="text-3xl font-script font-bold capitalize">
                        {user.name}
                      </h2>
                      <p className="text-muted-foreground">
                        Click to continue
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 max-w-md mx-auto bg-white/95 backdrop-blur">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${users.find(u => u.name === selectedUser)?.color} flex items-center justify-center`}>
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                  <h2 className="text-2xl font-script font-bold capitalize">
                    {selectedUser}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isSetupMode ? "Create your password" : "Enter your password"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={isSetupMode ? "Create password (min 8 characters)" : "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        data-testid="input-password"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isSetupMode && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          data-testid="input-confirm-password"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(null);
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loginMutation.isPending || setupMutation.isPending}
                      data-testid="button-submit"
                    >
                      {(loginMutation.isPending || setupMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isSetupMode ? "Setting up..." : "Logging in..."}
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          {isSetupMode ? "Set Password" : "Login"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {isSetupMode && (
                  <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
                    <p>🔒 Passwords are secured with bcrypt (cost factor 12)</p>
                    <p>Your password is hashed and never stored in plain text</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
