import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Wifi, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { resetData } from "@/lib/localStorage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [wifiSync, setWifiSync] = useState(false);

  const handleReset = () => {
    resetData();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/plan")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-script font-bold text-primary">
            Settings
          </h1>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 py-8 space-y-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Wi-Fi Sync</p>
                <p className="text-sm text-muted-foreground">
                  Future feature - Coming soon
                </p>
              </div>
            </div>
            <Switch
              checked={wifiSync}
              onCheckedChange={setWifiSync}
              disabled
              data-testid="toggle-wifi-sync"
            />
          </div>
        </Card>

        <Card className="p-6 border-destructive/20">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-destructive mt-1" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Danger Zone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete all your moments and tasks. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  data-testid="button-reset-data"
                >
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all moments and tasks for both
                    Daniel and Pacharee. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-reset">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-reset"
                  >
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Spirit Love Play</p>
          <p className="font-script text-primary">Made with love 💖</p>
        </div>
      </motion.div>
    </div>
  );
}
