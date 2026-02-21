import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizSettings, QuizResult, Word, SRSProgress } from '@/types/quiz';
import { INITIAL_VOCABULARY } from '@/lib/vocabulary';
import { calculateSRSUpdate, getWordId } from '@/lib/srs';

type AppState = 'setup' | 'quiz' | 'results' | 'planner';

interface QuizStore {
  // Data
  allWords: Word[];
  activeQueue: Word[];
  results: QuizResult[];
  userProgress: Record<string, SRSProgress>;
  
  // State
  appState: AppState;
  settings: QuizSettings;
  currentIndex: number;
  startTime: number;
  
  // Actions
  setAllWords: (words: Word[]) => void;
  startQuiz: (settings: QuizSettings) => void;
  startSRSReview: () => void;
  submitAnswer: (answer: string) => void;
  retryIncorrect: () => void;
  resetQuiz: () => void;
  goToSetup: () => void;
  goToPlanner: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      allWords: INITIAL_VOCABULARY,
      activeQueue: [],
      results: [],
      userProgress: {}, // Persisted SRS data
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

      goToPlanner: () => set({ appState: 'planner' }),
      goToSetup: () => set({ appState: 'setup' }),

      startSRSReview: () => {
        const { allWords, userProgress } = get();
        const now = Date.now();
        
        // Get Due Words
        const dueWords = allWords.filter(w => {
            const prog = userProgress[getWordId(w)];
            return prog && prog.dueDate <= now;
        });

        // Get New Words (up to 5 per session if due count is low)
        let queue = dueWords;
        if (queue.length < 10) {
            const newWords = allWords
                .filter(w => !userProgress[getWordId(w)])
                .slice(0, 10 - queue.length);
            queue = [...queue, ...newWords];
        }

        if (queue.length === 0) {
            alert("All caught up! No words due for review right now.");
            return;
        }

        set({
            settings: {
                mode: 'srs',
                direction: 'nl_jp', // Default for SRS for now
                categories: [],
                specificRows: [],
                wordCount: queue.length
            },
            activeQueue: queue,
            currentIndex: 0,
            results: [],
            appState: 'quiz',
            startTime: Date.now()
        });
      },

      startQuiz: (settings) => {
        const { allWords } = get();
        let filtered = allWords;

        // Filter by Category (if not empty)
        if (settings.categories.length > 0) {
          filtered = filtered.filter(w => {
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

        // SRS Zinnen Logic (simplified for brevity, reused from previous)
        if (settings.categories.length === 0 && settings.mode === 'zinnen') {
            filtered = allWords;
        }

        if (filtered.length === 0) {
          setTimeout(() => alert("No words found with these settings!"), 0);
          return;
        }

        let finalQueue: Word[] = [];

        if (settings.mode === 'zinnen') {
           // ... (Sentence generation logic from previous step would go here)
           // Re-implementing simplified version to ensure it works
           const nouns = allWords.filter(w => w.grammar === 'noun');
           const verbs = allWords.filter(w => w.grammar === 'verb');
           const subjects = nouns.filter(w => w.categorie === 'familie' || w.categorie === 'groeten');
           
           for (let i = 0; i < (settings.wordCount || 10); i++) {
                if (verbs.length > 0 && nouns.length > 0) {
                    const verb = verbs[Math.floor(Math.random() * verbs.length)];
                    const subject = subjects[Math.floor(Math.random() * subjects.length)] || nouns[0];
                    const object = nouns[Math.floor(Math.random() * nouns.length)];
                    finalQueue.push({
                        jp: `${subject.jp}は${object.jp}${verb.particle || 'を'}${verb.jp}。`,
                        nl: `${subject.nl} ${verb.nl} ${object.nl}.`,
                        romaji: `${subject.romaji} wa ${object.romaji} ${verb.particle === 'を' ? 'o' : verb.particle} ${verb.romaji}.`,
                        categorie: 'zinnen',
                        taal: 'mix',
                        hoofdklank: '',
                        grammar: 'verb'
                    });
                }
           }
        } else {
          finalQueue = [...filtered].sort(() => Math.random() - 0.5);
          if (settings.wordCount > 0) {
            finalQueue = finalQueue.slice(0, settings.wordCount);
          }
        }

        set({
          settings,
          activeQueue: finalQueue,
          currentIndex: 0,
          results: [],
          appState: 'quiz',
          startTime: Date.now()
        });
      },

      submitAnswer: (answer) => {
        const { activeQueue, currentIndex, results, settings, userProgress } = get();
        const currentWord = activeQueue[currentIndex];
        
        if (!currentWord) return;

        const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
        const safeAnswer = String(answer || "").toLowerCase().trim().replace(/[。.]$/, '');
        const safeTarget = String(target || "").toLowerCase().trim().replace(/[。.]$/, '');
        const isCorrect = safeAnswer === safeTarget;

        const newResult: QuizResult = { 
          word: currentWord, 
          userAnswer: answer, 
          isCorrect 
        };

        // UPDATE SRS PROGRESS if in SRS mode
        let updatedProgress = { ...userProgress };
        if (settings.mode === 'srs') {
            const id = getWordId(currentWord);
            const currentProg = userProgress[id];
            updatedProgress[id] = {
                ...calculateSRSUpdate(currentProg, isCorrect),
                wordId: id
            };
        }

        const nextIndex = currentIndex + 1;
        const isFinished = nextIndex >= activeQueue.length;

        set({
          results: [...results, newResult],
          currentIndex: isFinished ? currentIndex : nextIndex,
          appState: isFinished ? 'results' : 'quiz',
          userProgress: updatedProgress
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
          settings: { ...get().settings, mode: 'woorden' }
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
    }),
    {
      name: 'episolo-quiz-storage',
      partialize: (state) => ({ userProgress: state.userProgress }), // Only persist progress
    }
  )
);
