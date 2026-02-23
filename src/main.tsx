// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QuizApp } from './App'; // Zorg dat het pad klopt
import './globals.css';
import { ThemeProvider } from './components/theme-provider'; // Zorg dat het pad klopt
import { Toaster } from './components/ui/sonner'; // Zorg dat het pad klopt
import { AuthProvider } from './contexts/AuthContext'; // Zorg dat het pad klopt

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider> {/* BELANGRIJK: AuthProvider omhult de hele app */}
          <QuizApp />
        </AuthProvider>
      </Router>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);
