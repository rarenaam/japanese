    // src/contexts/AuthContext.tsx

    import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
    import { auth, db } from "@/lib/firebase"; // Zorg dat het pad klopt
    import {
      User as FirebaseUser,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      sendPasswordResetEmail,
      confirmPasswordReset
    } from "firebase/auth";

    // We mappen de Firebase User naar jouw User interface
    export interface User {
      userId: string;
      username: string;
      email?: string;
    }

    interface AuthResult {
      success: boolean;
      error?: string;
      user?: User;
    }

    interface PasswordResetResult {
      success: boolean;
      error?: string;
      message?: string;
    }

    interface AuthContextType {
      user: User | null;
      isLoading: boolean;
      login: (email: string, password: string) => Promise<AuthResult>;
      register: (userData: { username: string; email: string; password: string }) => Promise<AuthResult>;
      logout: () => void;
      isAuthenticated: () => boolean;
      requestPasswordReset: (email: string) => Promise<PasswordResetResult>;
      resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
    }

    const AuthContext = createContext<AuthContextType | null>(null);

    export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const [user, setUser] = useState<User | null>(null);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        // Luister naar de echte Firebase Auth status
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              userId: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
              email: firebaseUser.email || undefined
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });

        return () => unsubscribe();
      }, []);

      const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      };

      const register = async (userData: { username: string; email: string; password: string }): Promise<AuthResult> => {
        try {
          const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          // Optioneel: voeg de username toe aan het Firebase profiel
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      };

      const logout = () => {
        signOut(auth);
        setUser(null);
      };

      const isAuthenticated = () => user !== null;

      const requestPasswordReset = async (email: string): Promise<PasswordResetResult> => {
        try {
          await sendPasswordResetEmail(auth, email);
          return { success: true, message: "Reset email verzonden!" };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      };

      const resetPassword = async (token: string, newPassword: string): Promise<AuthResult> => {
        try {
          await confirmPasswordReset(auth, token, newPassword);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      };

      return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated, requestPasswordReset, resetPassword }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) throw new Error("useAuth must be used within an AuthProvider");
      return context;
    };
    ```
