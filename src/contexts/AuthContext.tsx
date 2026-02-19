import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { episoloCreateAuthManager } from "@/lib/episolo-db";

export interface User {
  userId: string;
  username: string;
  email?: string;
  [key: string]: any;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  message?: string;
}

interface PasswordResetResult {
  success: boolean;
  error?: string;
  message?: string;
  token?: string;
  email?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResult>;
  register: (userData: {
    username: string;
    email?: string;
    password: string;
    [key: string]: any;
  }) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: () => boolean;
  requestPasswordReset: (email: string) => Promise<PasswordResetResult>;
  verifyResetToken: (token: string) => Promise<PasswordResetResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create auth manager instance (database and auth are always available)
  const authManager = episoloCreateAuthManager();

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authManager.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    // Small delay to ensure entity service is initialized
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = async (
    usernameOrEmail: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const result = await authManager.login(usernameOrEmail, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (userData: {
    username: string;
    email?: string;
    password: string;
    [key: string]: any;
  }): Promise<AuthResult> => {
    try {
      const result = await authManager.register(userData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    authManager.logout();
    setUser(null);
  };

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const requestPasswordReset = async (
    email: string,
  ): Promise<PasswordResetResult> => {
    try {
      return await authManager.requestPasswordReset(email);
    } catch (error) {
      console.error("Password reset request error:", error);
      return { success: false, error: "Failed to request password reset" };
    }
  };

  const verifyResetToken = async (
    token: string,
  ): Promise<PasswordResetResult> => {
    try {
      return await authManager.verifyResetToken(token);
    } catch (error) {
      console.error("Token verification error:", error);
      return { success: false, error: "Failed to verify reset token" };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<AuthResult> => {
    try {
      return await authManager.resetPassword(token, newPassword);
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "Failed to reset password" };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
