import { create } from 'zustand';
import { QuizSettings, QuizResult, Word } from '@/types/quiz';
import { INITIAL_VOCABULARY } from '@/lib/vocabulary';

type AppState = 'setup' | 'quiz' | 'results';

interface QuizStore {
  // Data
  allWords: Word[];
  activeQueue: Word[];
  results: QuizResult[];
  
  // State
  appState: AppState;
  settings: QuizSettings;
  currentIndex: number;
  startTime: number;
  
  // Actions
  setAllWords: (words: Word[]) => void;
  startQuiz: (settings: QuizSettings) => void;
  submitAnswer: (answer: string) => void;
  retryIncorrect: () => void;
  resetQuiz: () => void;
  goToSetup: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  allWords: INITIAL_VOCABULARY,
  activeQueue: [],
  results: [],
  appState: 'setup',
  settings: {
    mode: 'woorden',
    direction: 'nl_jp',
    categories: [],
    specificRows: [],
    wordCount: 0,
  },
  currentIndex: 0,
  startTime: 0,

  setAllWords: (words) => set({ allWords: words }),

  startQuiz: (settings) => {
    const { allWords } = get();
    let filtered = allWords;

    // Filter by Category
    if (settings.categories.length > 0) {
      filtered = filtered.filter(w => {
        // Fix: Robust null check before toLowerCase
        const cat = String(w.categorie || "").toLowerCase();
        return settings.categories.some(c => String(c || "").toLowerCase() === cat);
      });
    }

    // Filter by Kana Rows if applicable
    if (settings.specificRows.length > 0) {
      filtered = filtered.filter(w => 
        w.hoofdklank && settings.specificRows.includes(w.hoofdklank)
      );
    }

    // Shuffle
    filtered = [...filtered].sort(() => Math.random() - 0.5);

    // Limit count (if not infinite/0)
    if (settings.wordCount > 0) {
      filtered = filtered.slice(0, settings.wordCount);
    }

    if (filtered.length === 0) {
      // Use a timeout to allow the UI to update before alerting
      setTimeout(() => alert("Geen woorden gevonden met deze instellingen! / No words found with these settings!"), 0);
      return;
    }

    set({
      settings,
      activeQueue: filtered,
      currentIndex: 0,
      results: [],
      appState: 'quiz',
      startTime: Date.now()
    });
  },

  submitAnswer: (answer: string) => {
    const { activeQueue, currentIndex, results, settings } = get();
    const currentWord = activeQueue[currentIndex];
    
    if (!currentWord) return;

    const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
    
    // Fix: Robust null check for answer and target
    const safeAnswer = String(answer || "").toLowerCase().trim();
    const safeTarget = String(target || "").toLowerCase().trim();
    
    const isCorrect = safeAnswer === safeTarget;

    const newResult: QuizResult = { 
      word: currentWord, 
      userAnswer: answer, 
      isCorrect 
    };

    const nextIndex = currentIndex + 1;
    const isFinished = nextIndex >= activeQueue.length;

    set({
      results: [...results, newResult],
      currentIndex: isFinished ? currentIndex : nextIndex,
      appState: isFinished ? 'results' : 'quiz'
    });
  },

  retryIncorrect: () => {
    const { results } = get();
    const incorrectWords = results.filter(r => !r.isCorrect).map(r => r.word);
    
    if (incorrectWords.length === 0) return;

    set({
      activeQueue: incorrectWords,
      currentIndex: 0,
      results: [],
      appState: 'quiz',
      startTime: Date.now(),
      settings: { ...get().settings, mode: 'woorden' } // Force study mode for retries
    });
  },

  resetQuiz: () => {
    set({
      appState: 'setup',
      results: [],
      currentIndex: 0,
      activeQueue: []
    });
  },

  goToSetup: () => set({ appState: 'setup' })
}));
