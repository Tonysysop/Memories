import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Mail, Lock, User, ArrowRight, Camera, Sparkles, Check, X, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

const passwordRequirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
];

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const metCount = passwordRequirements.filter((req) => req.test(password)).length;
  const strength = metCount === 0 ? 0 : metCount <= 2 ? 1 : metCount <= 3 ? 2 : 3;
  const strengthLabels = ["", "Weak", "Fair", "Strong"];
  const strengthColors = ["bg-muted", "bg-destructive", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="space-y-3 mt-3">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength >= level ? strengthColors[strength] : "bg-muted"
            }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs font-medium ${
          strength === 1 ? "text-destructive" : strength === 2 ? "text-yellow-600" : strength === 3 ? "text-green-600" : "text-muted-foreground"
        }`}>
          {strengthLabels[strength]}
        </p>
      )}
      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-2">
        {passwordRequirements.map((req) => {
          const met = req.test(password);
          return (
            <div key={req.label} className="flex items-center gap-2">
              {met ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={`text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignupFormData | LoginFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password") || "";

  const onSubmit = async (data: SignupFormData | LoginFormData) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: (data as SignupFormData).name,
            },
          },
        });
        if (error) throw error;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              name: (data as SignupFormData).name,
            });
          
          if (profileError) {
             console.error('Error creating profile:', profileError);
             // Verify if we should block or just warn. For now, warn.
          }
        }

        if (authData.session) {
          toast.success("Account created successfully! Welcome to Memories.");
          navigate("/dashboard");
        } else {
          setShowConfirmModal(true);
          setIsLogin(true); // Switch to login view after signup
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Left Side - Design/Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent to-secondary relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent/40 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-float" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center glow-primary mb-6 mx-auto">
                <Heart className="w-10 h-10 text-primary-foreground fill-current" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Capture Every<br />
                <span className="text-gradient-primary">Precious Moment</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Create beautiful memory collections from your events and share them with the people who matter most.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4 w-full max-w-sm">
              <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 card-elevated">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Easy Collection</h3>
                  <p className="text-sm text-muted-foreground">Guests upload photos via QR code</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 card-elevated">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Beautiful Galleries</h3>
                  <p className="text-sm text-muted-foreground">Auto-organized, ready to share</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
                <Heart className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">
                MEMORIES
              </span>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Sign in to access your memories" 
                  : "Start collecting memories today"}
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {!isLogin && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                            <Input
                              type="text"
                              placeholder="Enter your name"
                              className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      {!isLogin && <PasswordStrengthIndicator password={password} />}
                    </FormItem>
                  )}
                />

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-medium group" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                  {!isLoading && (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </Button>
            </div>

            {/* Toggle Login/Signup */}
            <p className="text-center mt-8 text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl font-display">Confirm Your Email</DialogTitle>
              <DialogDescription className="text-center pt-2">
                We've sent a verification link to your email. Please click the link in the message to activate your account.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Once confirmed, you'll be able to sign in and start creating events. Can't find the email? Check your spam folder.
              </p>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button 
                  type="button" 
                  className="w-full sm:w-32" 
                  onClick={() => setShowConfirmModal(false)}
              >
                Got it!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Auth;
