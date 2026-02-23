// src/App.tsx (of het bestand waar je hoofdcomponent is)
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { 
  Sun, Moon, GraduationCap, LogIn, 
  User as UserIcon, CalendarDays, Sparkles 
} from 'lucide-react';

// Store & Hooks (Correcte paden)
import { useQuizStore } from '@/store/useQuizStore';
import { useAuth } from '@/hooks/use-auth'; // Correct pad

// UI Components (Radix/Shadcn) - Deze zijn meestal globaal of via @/components/ui/
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Feature Components - NU MET DE DEFINITIEF CORRECTE PADEN
import LoginPage from '@/components/LoginPage'; // Correct: src/components/LoginPage.tsx
import { QuizSetup } from '@/components/quiz/QuizSetup'; // Correct: src/components/quiz/QuizSetup.tsx
import { QuizSession } from '@/components/quiz/QuizSession'; // Correct: src/components/quiz/QuizSession.tsx
import { QuizResults } from '@/components/quiz/QuizResults'; // Correct: src/components/quiz/QuizResults.tsx
import { SRSPlanner } from '@/components/SRSPlanner'; // Correct: src/components/SRSPlanner.tsx

// Aangenomen dat deze constanten globaal of uit een ander bestand komen
import { CATEGORIES, KANA_ROWS } from '@/lib/vocabulary'; 


// --- BELANGRIJK: ZORG DAT DEZE IMPORTS BOVENIN JE BESTAND STAAN ---
import { auth } from './lib/firebase'; // Correct: relatief pad naar src/lib/firebase.ts
import { onAuthStateChanged } from 'firebase/auth'; 


/**
 * HOOFDCOMPONENT: QuizApp
 * Beheert de globale layout, authenticatie-checks en de routering 
 * tussen de verschillende quiz-fases.
 */
export const QuizApp = () => {
  const appState = useQuizStore((state) => state.appState);
  const initializeData = useQuizStore((state) => state.initializeData);
  const setAuthLoaded = useQuizStore((state) => state.setAuthLoaded);
  const isAuthLoaded = useQuizStore((state) => state.isAuthLoaded);
  
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // DEZE USEEFFECT WACHT NU OP DE AUTHENTICATIESTATUS
  useEffect(() => {
    // Stel appState in op 'loading' zodra we beginnen met initialiseren
    useQuizStore.setState({ appState: 'loading' });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Firebase Auth State veranderd. Gebruiker:", firebaseUser ? firebaseUser.uid : "Geen");
      setAuthLoaded(true); // Geef aan dat de auth-status bekend is
      initializeData(); // Roep de data-initialisatie aan, nu de auth-status bekend is
    });

    // Cleanup de listener wanneer de component unmount
    return () => unsubscribe();
  }, [initializeData, setAuthLoaded]);

  // --- LOADING STATE ---
  if (appState === 'loading' && !isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <GraduationCap className="absolute inset-0 m-auto h-10 w-10 text-primary/40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Laden...</h3>
            <p className="text-sm text-muted-foreground animate-pulse">Authenticatie en vocabulaire ophalen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background relative transition-colors duration-500">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter hidden sm:inline-block">
              JPN-TRAINER
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-md p-1 pr-3 rounded-full border border-primary/10 shadow-sm animate-in slide-in-from-left-4">
              <Badge variant="secondary" className="rounded-full px-2 py-1 bg-primary/5">
                <UserIcon className="h-3 w-3 mr-1 text-primary" /> {user.username}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout} 
                className="h-7 text-xs px-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full bg-background/50 backdrop-blur-sm border-2">
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="rounded-full bg-background/50 backdrop-blur-sm border-2 shadow-sm"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <main className="container mx-auto py-8 pt-24 min-h-screen">
        <Routes>
          <Route path="/" element={
            user ? (
              <div className="w-full max-w-5xl mx-auto">
                {appState === 'setup' && <QuizSetup />}
                {appState === 'planner' && <SRSPlanner />}
                {appState === 'quiz' && <QuizSession />}
                {appState === 'results' && <QuizResults />}
                {appState === 'loading' && isAuthLoaded && (
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Laden van data...</p>
                  </div>
                )}
              </div>
            ) : (
              <LandingHero />
            )
          } />

          <Route path="/login" element={<LoginPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer / Decoratie */}
      <footer className="py-8 text-center text-xs text-muted-foreground opacity-50">
        &copy; {new Date().getFullYear()} Japanese Vocabulary Trainer &bull; Spaced Repetition System
      </footer>
    </div>
  );
};


/**
 * SUB-COMPONENT: LandingHero
 * Deze component moet in een apart bestand staan en geïmporteerd worden.
 * Bijvoorbeeld: `src/components/LandingHero.tsx`
 * Indien deze nog niet bestaat, zul je deze moeten aanmaken en importeren.
 * Voor nu is hij hier inline geplaatst zodat de app wel compileert, maar
 * idealiter verplaats je deze.
 */
const LandingHero = () => (
  <div className="max-w-3xl mx-auto text-center py-20 space-y-8 animate-in fade-in zoom-in-95 duration-700">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
      <Sparkles className="h-4 w-4" />
      <span>Leer Japans met wetenschappelijk onderbouwde methodes</span>
    </div>
    
    <div className="space-y-4">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
        Klaar om <span className="text-red-500">Japans</span> te leren?
      </h1>
      <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
        Beheers Hiragana, Katakana en duizenden woorden met onze interactieve trainer en smart Spaced Repetition planner.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <Link to="/login">
        <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl shadow-red-500/20 bg-red-600 hover:bg-red-700">
          Nu beginnen
        </Button>
      </Link>
      <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg" disabled>
        Bekijk demo
      </Button>
    </div>

    <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
      <div>
        <p className="text-2xl font-bold">100%</p>
        <p className="text-xs text-muted-foreground uppercase">Gratis</p>
      </div>
      <div>
        <p className="text-2xl font-bold">SRS</p>
        <p className="text-xs text-muted-foreground uppercase">Planner</p>
      </div>
      <div>
        <p className="text-2xl font-bold">CSV</p>
        <p className="text-xs text-muted-foreground uppercase">Import</p>
      </div>
    </div>
  </div>
);

export default QuizApp;
