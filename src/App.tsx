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

// --- FIREBASE IMPORTS VOOR UPLOAD (GEFIXED PAD) ---
import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_VOCABULARY } from './lib/vocabulary'; // Veranderd van ./data naar ./lib
// ------------------------------------

const queryClient = new QueryClient();

const App = () => {
  // --- TIJDELIJKE FUNCTIE OM DATA TE VERSTUREN ---
  const seedDatabase = async () => {
    try {
      console.log("Uploaden gestart...");
      // Check of de lijst bestaat voordat we beginnen
      if (!INITIAL_VOCABULARY || INITIAL_VOCABULARY.length === 0) {
        alert("Oeps, de woordenlijst lijkt leeg te zijn!");
        return;
      }

      for (const word of INITIAL_VOCABULARY) {
        // We slaan elk woord op in de collectie 'words'
        await setDoc(doc(db, "words", word.id), word);
      }
      alert("Succes! Je hele woordenlijst staat nu in Firebase.");
    } catch (error) {
      console.error("Fout bij uploaden:", error);
      alert("Er ging iets mis. Check of je Firebase Database op 'Test Mode' staat!");
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
                top: '10px',
                right: '10px',
                zIndex: 9999,
                background: '#ff9800',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              🚀 Klik hier: Upload naar Firebase
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
