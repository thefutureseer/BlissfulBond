import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute, useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/Landing";
import EmotionCheckIn from "@/pages/EmotionCheckIn";
import Dashboard from "@/pages/Dashboard";
import Entry from "@/pages/Entry";
import Plan from "@/pages/Plan";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Home route - redirects based on auth status
function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-200 to-amber-300 flex items-center justify-center">
        <div className="text-white text-xl font-script">Loading...</div>
      </div>
    );
  }
  
  // Show Landing page for non-authenticated users
  // Show Dashboard for authenticated users
  return isAuthenticated ? <Dashboard /> : <Landing />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/emotions">
        <ProtectedRoute>
          <EmotionCheckIn />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/entry">
        <ProtectedRoute>
          <Entry />
        </ProtectedRoute>
      </Route>
      <Route path="/plan">
        <ProtectedRoute>
          <Plan />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
