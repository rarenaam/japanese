import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  // Add stable key to BrowserRouter to ensure proper initialization
  // This prevents context-related race conditions on initial mount
  const [routerKey] = React.useState(() => `router-${Date.now()}`);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {/* HIER IS DE FIX: basename="/japanese" toegevoegd */}
          <BrowserRouter key={routerKey} basename="/japanese">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🚨 CRITICAL: ADD ALL CUSTOM ROUTES HERE (BEFORE THE "*" ROUTE) 
                  When creating new pages (e.g. Dashboard.tsx), you MUST:
                  1. Import: import Dashboard from "./pages/Dashboard";
                  2. Add Route: <Route path="/dashboard" element={<Dashboard />} />
                  3. Place it HERE, BEFORE the "*" catch-all route below
                  Otherwise users will get 404 errors! */}

              {/* Keep this catch-all route LAST - it shows 404 for undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
