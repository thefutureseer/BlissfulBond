import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const forgotPasswordSchema = z.object({
  name: z.enum(["daniel", "pacharee"], {
    required_error: "Please select your name",
  }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      await apiRequest("POST", "/api/auth/password-reset/request", data);
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check the console for your password reset link.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Spirit Love Play
          </h1>
        </div>

        <Card className="border-2 border-rose-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? "Check your email for the reset link"
                : "We'll send you a magic link to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-700">
                      A password reset link has been sent.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      For development: Check the server console logs
                    </p>
                  </div>
                </div>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-name">
                              <SelectValue placeholder="Select your name" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daniel">Daniel</SelectItem>
                            <SelectItem value="pacharee">Pacharee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    disabled={resetMutation.isPending}
                    data-testid="button-send-reset-link"
                  >
                    {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      type="button"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </Link>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
