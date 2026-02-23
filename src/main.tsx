// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QuizApp } from './App'; // Relatief pad naar QuizApp
import './globals.css';

// --- AANPASSINGEN HIER ---
// Importeer ThemeProvider direct van de 'next-themes' bibliotheek
import { ThemeProvider } from 'next-themes'; 
// Importeer Toaster correct vanuit je UI-componenten map
import { Toaster } from '@/components/ui/sonner'; 
// Importeer AuthProvider correct vanuit je contexts map
import { AuthProvider } from '@/contexts/AuthContext'; 
// --- EINDE AANPASSINGEN ---

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Gebruik de ThemeProvider van next-themes met standaard props */}
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router>
        <AuthProvider> {/* AuthProvider omhult de hele app */}
          <QuizApp />
        </AuthProvider>
      </Router>
      <Toaster /> {/* Toaster moet binnen de Router en ThemeProvider */}
    </ThemeProvider>
  </React.StrictMode>,
);
