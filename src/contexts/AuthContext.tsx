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

// src/contexts/AuthContext.tsx
// ... (rest van de imports) ...

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(`[AuthContext] onAuthStateChanged gedetecteerd. FirebaseUser: ${firebaseUser ? firebaseUser.uid : "Geen"}`); // NIEUWE LOG
      if (firebaseUser) {
        setUser({
          userId: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          email: firebaseUser.email || undefined
        });
        console.log(`[AuthContext] User state ingesteld op: ${firebaseUser.uid}`); // NIEUWE LOG
      } else {
        setUser(null);
        console.log(`[AuthContext] User state ingesteld op: null`); // NIEUWE LOG
      }
      setIsLoading(false);
      console.log(`[AuthContext] isLoading ingesteld op: false`); // NIEUWE LOG
    });

    return () => unsubscribe();
  }, []);
// ... (rest van de code blijft hetzelfde tot aan de login functie) ...

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Als de login succesvol is, zal de onAuthStateChanged listener afgaan
      // en de 'user' state van deze context bijwerken.
      console.log("Login succesvol!"); // <-- DEZE LOG TOEVOEGEN
      return { success: true };
    } catch (error: any) {
      // BELANGRIJKE WIJZIGING: Log de gedetailleerde foutcode en het bericht hier!
      console.error("Login mislukt:", error.code, error.message); // <-- DEZE REGEL TOEVOEGEN
      return { success: false, error: error.message };
    }
  };

// ... (rest van de code blijft hetzelfde) ...


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
