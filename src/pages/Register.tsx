import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { UserPlus, User, Lock, Mail, ArrowRight, Loader2, Check } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, register } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];

    return {
      strength,
      label: labels[strength],
    };
  };

  const passwordStrength = getPasswordStrength();

  // Get color class based on strength
  const getStrengthColor = (level: number) => {
    if (passwordStrength.strength < level) return "bg-muted";
    if (passwordStrength.strength <= 1) return "bg-destructive";
    if (passwordStrength.strength <= 2) return "bg-orange-500";
    if (passwordStrength.strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success("Welcome aboard! Your account is ready.");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-8">
      {/* Subtle gradient overlay using primary color */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

      {/* Decorative elements using theme colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto p-4 bg-primary rounded-2xl w-fit shadow-lg shadow-primary/20">
              <UserPlus className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Join us and start your journey
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
                {formData.password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${getStrengthColor(level)}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-muted-foreground bg-card">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group"
              >
                Sign in instead
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center mt-8 text-muted-foreground/50 text-sm">
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Register;
