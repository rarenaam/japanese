export interface Word {
  jp: string;
  nl: string;
  romaji: string;
  categorie: string;
  taal: string;
  hoofdklank: string;
}

export type QuizMode = 'toets' | 'woorden';
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
