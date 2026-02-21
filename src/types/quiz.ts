export type GrammarType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'particle';

export interface Word {
  jp: string;
  nl: string;
  romaji: string;
  categorie: string;
  taal: string;
  hoofdklank: string;
  grammar?: GrammarType;
  targets?: string[]; 
  particle?: string;
}

export type QuizMode = 'toets' | 'woorden' | 'zinnen' | 'srs';
export type Direction = 'nl_jp' | 'jp_nl';

export interface QuizSettings {
  mode: QuizMode;
  direction: Direction;
  categories: string[];
  specificRows: string[];
  wordCount: number;
}

export interface QuizResult {
  word: Word;
  userAnswer: string;
  isCorrect: boolean;
}

// SRS Types
export interface SRSProgress {
  wordId: string;
  interval: number; // Days until next review
  ease: number; // Difficulty multiplier
  dueDate: number; // Timestamp
  streak: number; // Consecutive correct answers
  lastReviewed: number; // Timestamp
  status: 'new' | 'learning' | 'review' | 'graduated';
}

export interface SRSStats {
  totalWords: number;
  learnedWords: number;
  dueToday: number;
  upcoming: number;
  accuracy: number;
}
Close
