import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// --- FIREBASE IMPORTS VOOR UPLOAD ---
import { db } from './lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { INITIAL_VOCABULARY } from './data/vocabulary'; 
// ------------------------------------

const queryClient = new QueryClient();

const App = () => {
  // --- TIJDELIJKE FUNCTIE OM DATA TE VERSTUREN ---
  const seedDatabase = async () => {
    try {
      console.log("Uploaden gestart...");
      for (const word of INITIAL_VOCABULARY) {
        // We slaan elk woord op in de collectie 'words'
        await setDoc(doc(db, "words", word.id), word);
      }
      alert("Succes! Je hele woordenlijst staat nu in Firebase.");
    } catch (error) {
      console.error("Fout bij uploaden:", error);
      alert("Er ging iets mis. Heb je Firestore op 'Test Mode' gezet?");
    }
  };
  // ----------------------------------------------

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            {/* TIJDELIJKE KNOP BOVENAAN JE SCHERM */}
            <button 
              onClick={seedDatabase}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                background: 'orange',
                color: 'white',
                padding: '10px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🚀 Klik hier: Upload woorden naar Firebase
            </button>

            <Toaster />
            <BrowserRouter basename="/japanese">
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Authentication routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Catch-all route voor 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
