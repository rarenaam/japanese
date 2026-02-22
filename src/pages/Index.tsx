import { useEffect } from 'react';
import { QuizApp } from '@/components/QuizApp';
import { useQuizStore } from '@/store/useQuizStore';
import { auth } from '@/lib/firebase';

const Index = () => {
  const initialize = useQuizStore((state) => state.initialize);
  const appState = useQuizStore((state) => state.appState);

  useEffect(() => {
    // Luister naar veranderingen in de login-status
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // Zodra Firebase weet of er een gebruiker is, laden we de data
      initialize();
    });

    return () => unsubscribe();
  }, [initialize]);

  // Toon een laadscherm zolang de data uit Firebase wordt gehaald
  if (appState === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground animate-pulse">
          Japanse data ophalen uit de cloud...
        </p>
      </div>
    );
  }

  return <QuizApp />;
};

export default Index;
