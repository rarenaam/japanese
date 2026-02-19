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
import { Email } from "@/lib/email-service";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { user, requestPasswordReset } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);

      if (result.success && result.token) {
        // Get the current origin for the reset link
        const resetLink = `${window.location.origin}/reset-password?token=${result.token}`;

        // Send the password reset email
        try {
          await Email.send({
            to: [email],
            subject: "Reset Your Password",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse;">
                          <!-- Header -->
                          <tr>
                            <td style="background: #18181b; border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                                Password Reset Request
                              </h1>
                            </td>
                          </tr>
                          <!-- Main content -->
                          <tr>
                            <td style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                                Hi${result.username ? ` ${result.username}` : ""},
                              </p>
                              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 24px;">
                                We received a request to reset your password. Click the button below to create a new password:
                              </p>
                              <!-- CTA Button -->
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td align="center" style="padding: 10px 0 30px;">
                                    <a href="${resetLink}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                                      Reset Password
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 22px;">
                                This link will expire in 1 hour for security reasons.
                              </p>
                              <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 22px;">
                                If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
                              </p>
                              <!-- Divider -->
                              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                                If the button does not work, copy and paste this link into your browser:
                              </p>
                              <p style="margin: 8px 0 0; word-break: break-all;">
                                <a href="${resetLink}" style="color: #6366f1; font-size: 12px; text-decoration: none;">${resetLink}</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
            text: `Password Reset Request\n\nHi${result.username ? ` ${result.username}` : ""},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this password reset, you can safely ignore this email.`,
          });

          setIsEmailSent(true);
          toast.success("Password reset email sent!");
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          toast.error(
            "Failed to send reset email. Please try again later.",
          );
        }
      } else if (result.success) {
        // Token was not returned (user not found), but we still show success for security
        setIsEmailSent(true);
      } else {
        toast.error(result.error || "Failed to process request");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
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
              <div className="mx-auto p-4 bg-green-500 rounded-2xl w-fit shadow-lg shadow-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-foreground">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  We have sent a password reset link to{" "}
                  <span className="text-foreground font-medium">{email}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Send className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      The link will expire in 1 hour. If you do not see the
                      email, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full h-12"
                >
                  Try a different email
                </Button>

                <Link to="/login" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
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
              <KeyRound className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                No worries! Enter your email and we will send you a reset link.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-background border-input focus:border-primary focus:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-muted-foreground bg-card">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center mt-8 text-muted-foreground/50 text-sm">
          Secure password recovery powered by Episolo
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
