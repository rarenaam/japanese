import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { QuizSettings, QuizResult, Word, SRSProgress } from '@/types/quiz';
import { calculateSRSUpdate, getWordId } from '@/lib/srs';

type AppState = 'loading' | 'setup' | 'quiz' | 'results' | 'planner';

interface QuizStore {
  // State
  allWords: Word[];
  activeQueue: Word[];
  results: QuizResult[];
  userProgress: Record<string, SRSProgress>;
  appState: AppState;
  settings: QuizSettings;
  currentIndex: number;
  startTime: number;

  // Actions
  initialize: () => Promise<void>;
  setAllWords: (words: Word[]) => void;
  startQuiz: (settings: QuizSettings) => void;
  startSRSReview: () => void;
  submitAnswer: (answer: string) => Promise<void>;
  retryIncorrect: () => void;
  resetQuiz: () => void;
  goToSetup: () => void;
  goToPlanner: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial State
  allWords: [],
  activeQueue: [],
  results: [],
  userProgress: {},
  appState: 'loading',
  settings: {
    mode: 'woorden',
    direction: 'nl_jp',
    categories: [],
    specificRows: [],
    wordCount: 0,
  },
  currentIndex: 0,
  startTime: 0,

  // Haal data op uit Firebase zodra de gebruiker is ingelogd
 // Haal data op uit Firebase zodra de auth status bekend is
initialize: async () => {
    console.log("🚀 Woorden laden gestart...");
    set({ appState: 'loading' });

    try {
      // 1. Haal DIRECT de woorden op (niet wachten op auth)
      const wordsSnap = await getDocs(collection(db, "words"));
      const words = wordsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Word));
      console.log(`✅ Succes! ${words.length} woorden geladen.`);
      
      // We zetten de woorden direct in de store
      set({ allWords: words });

      // 2. Nu pas gaan we kijken of er een gebruiker is voor de voortgang
      // We doen dit op de achtergrond, zodat de app niet hoeft te wachten
      const user = auth.currentUser;
      let progress: Record<string, SRSProgress> = {};

      if (user) {
        try {
          const progressSnap = await getDocs(collection(db, `users/${user.uid}/progress`));
          progressSnap.forEach(d => {
            progress[d.id] = d.data() as SRSProgress;
          });
          console.log("📈 Voortgang geladen.");
        } catch (e) {
          console.warn("⚠️ Kon voortgang niet laden (beveiliging of geen data).", e);
        }
      }

      // 3. We zijn klaar, naar de setup!
      set({ userProgress: progress, appState: 'setup' });

    } catch (error) {
      console.error("❌ Fout bij laden woorden:", error);
      // Zelfs bij een fout gaan we naar setup, zodat de site werkt
      set({ appState: 'setup' });
    }
  },initialize: async () => {
    console.log("🚀 Woorden laden gestart...");
    set({ appState: 'loading' });

    try {
      // 1. Haal DIRECT de woorden op (niet wachten op auth)
      const wordsSnap = await getDocs(collection(db, "words"));
      const words = wordsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Word));
      console.log(`✅ Succes! ${words.length} woorden geladen.`);
      
      // We zetten de woorden direct in de store
      set({ allWords: words });

      // 2. Nu pas gaan we kijken of er een gebruiker is voor de voortgang
      // We doen dit op de achtergrond, zodat de app niet hoeft te wachten
      const user = auth.currentUser;
      let progress: Record<string, SRSProgress> = {};

      if (user) {
        try {
          const progressSnap = await getDocs(collection(db, `users/${user.uid}/progress`));
          progressSnap.forEach(d => {
            progress[d.id] = d.data() as SRSProgress;
          });
          console.log("📈 Voortgang geladen.");
        } catch (e) {
          console.warn("⚠️ Kon voortgang niet laden (beveiliging of geen data).", e);
        }
      }

      // 3. We zijn klaar, naar de setup!
      set({ userProgress: progress, appState: 'setup' });

    } catch (error) {
      console.error("❌ Fout bij laden woorden:", error);
      // Zelfs bij een fout gaan we naar setup, zodat de site werkt
      set({ appState: 'setup' });
    }
  },
  setAllWords: (words) => set({ allWords: words }),
  goToPlanner: () => set({ appState: 'planner' }),
  goToSetup: () => set({ appState: 'setup' }),

  startSRSReview: () => {
    const { allWords, userProgress } = get();
    const now = Date.now();
    const dueWords = allWords.filter(w => {
      const prog = userProgress[getWordId(w)];
      return prog && prog.dueDate <= now;
    });

    let queue = dueWords;
    if (queue.length < 10) {
      const newWords = allWords
        .filter(w => !userProgress[getWordId(w)])
        .slice(0, 10 - queue.length);
      queue = [...queue, ...newWords];
    }

    if (queue.length === 0) {
      alert("Alles bijgewerkt! Geen woorden om te herhalen.");
      return;
    }

    set({
      settings: { mode: 'srs', direction: 'nl_jp', categories: [], specificRows: [], wordCount: queue.length },
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

    if (settings.categories.length > 0) {
      filtered = filtered.filter(w => settings.categories.includes(w.categorie));
    }

    if (settings.specificRows.length > 0) {
      filtered = filtered.filter(w => w.hoofdklank && settings.specificRows.includes(w.hoofdklank));
    }

    let finalQueue: Word[] = [];

    if (settings.mode === 'zinnen') {
      const nouns = allWords.filter(w => w.grammar === 'noun');
      const verbs = allWords.filter(w => w.grammar === 'verb');
      const potentialSubjects = allWords.filter(w => w.categorie === 'familie' || w.jp === 'わたし');

      for (let i = 0; i < (settings.wordCount || 10); i++) {
        if (verbs.length > 0 && nouns.length > 0) {
          const verb = verbs[Math.floor(Math.random() * verbs.length)];
          const validObjects = nouns.filter(n => 
            !verb.targets || verb.targets.length === 0 || verb.targets.includes(n.categorie)
          );
          const object = validObjects.length > 0 
            ? validObjects[Math.floor(Math.random() * validObjects.length)]
            : nouns[Math.floor(Math.random() * nouns.length)];
          const subject = potentialSubjects.length > 0 
            ? potentialSubjects[Math.floor(Math.random() * potentialSubjects.length)] 
            : { jp: "わたし", nl: "ik", romaji: "watashi" };

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
      if (settings.wordCount > 0) finalQueue = finalQueue.slice(0, settings.wordCount);
    }

    if (finalQueue.length === 0) {
      alert("Geen woorden gevonden!");
      return;
    }

    set({ settings, activeQueue: finalQueue, currentIndex: 0, results: [], appState: 'quiz', startTime: Date.now() });
  },

  submitAnswer: async (answer) => {
    const { activeQueue, currentIndex, results, settings, userProgress } = get();
    const user = auth.currentUser;
    const currentWord = activeQueue[currentIndex];
    if (!currentWord) return;

    const target = settings.direction === 'nl_jp' ? currentWord.jp : currentWord.nl;
    const safeAnswer = String(answer || "").toLowerCase().trim().replace(/[。.]$/, '');
    const safeTarget = String(target || "").toLowerCase().trim().replace(/[。.]$/, '');
    const isCorrect = safeAnswer === safeTarget;

    let updatedProgressMap = { ...userProgress };

    // Als de gebruiker is ingelogd en we zitten in SRS mode, sla op in Firebase
    if (user && settings.mode === 'srs') {
      const id = getWordId(currentWord);
      const newProgress = calculateSRSUpdate(userProgress[id], isCorrect);
      
      try {
        await setDoc(doc(db, `users/${user.uid}/progress`, id), {
          ...newProgress,
          wordId: id,
          lastUpdated: Date.now()
        });
        updatedProgressMap[id] = newProgress;
      } catch (e) {
        console.error("Fout bij opslaan voortgang:", e);
      }
    }

    const nextIndex = currentIndex + 1;
    const isFinished = nextIndex >= activeQueue.length;

    set({
      results: [...results, { word: currentWord, userAnswer: answer, isCorrect }],
      currentIndex: isFinished ? currentIndex : nextIndex,
      appState: isFinished ? 'results' : 'quiz',
      userProgress: updatedProgressMap
    });
  },

  retryIncorrect: () => {
    const incorrectWords = get().results.filter(r => !r.isCorrect).map(r => r.word);
    if (incorrectWords.length === 0) return;
    set({ activeQueue: incorrectWords, currentIndex: 0, results: [], appState: 'quiz', startTime: Date.now() });
  },

  resetQuiz: () => set({ appState: 'setup', results: [], currentIndex: 0, activeQueue: [] }),
}));
