import { Word, SRSProgress } from '@/types/quiz';

// Generate a unique ID for a word
export const getWordId = (word: Word): string => {
  return `${word.romaji}-${word.jp}`.toLowerCase().replace(/\s+/g, '-');
};

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;

// Simplified SM-2 Algorithm adaptation for Pass/Fail input
export const calculateSRSUpdate = (current: SRSProgress | undefined, isCorrect: boolean): SRSProgress => {
  const now = Date.now();
  
  // Default new state
  let progress: SRSProgress = current || {
    wordId: '',
    interval: 0,
    ease: INITIAL_EASE,
    dueDate: now,
    streak: 0,
    lastReviewed: 0,
    status: 'new'
  };

  if (!isCorrect) {
    // Failed: Reset streak, interval drops to 0 (review again immediately/tomorrow)
    return {
      ...progress,
      interval: 0,
      streak: 0,
      dueDate: now, // Due immediately/today
      status: 'learning',
      lastReviewed: now,
      // Penalty to ease factor
      ease: Math.max(MIN_EASE, progress.ease - 0.2)
    };
  }

  // Correct Answer Logic
  let newInterval = 1;
  let newEase = progress.ease;
  
  if (progress.streak === 0) {
    newInterval = 1;
  } else if (progress.streak === 1) {
    newInterval = 6;
  } else {
    // SM-2 formula: I(n) = I(n-1) * EF
    newInterval = Math.round(progress.interval * progress.ease);
  }

  // Bonus to ease for streaks
  if (progress.streak > 2) {
    newEase = Math.min(newEase + 0.1, 5.0);
  }

  return {
    ...progress,
    interval: newInterval,
    ease: newEase,
    streak: progress.streak + 1,
    dueDate: now + (newInterval * 24 * 60 * 60 * 1000),
    lastReviewed: now,
    status: newInterval > 21 ? 'graduated' : 'review'
  };
};

export const getWordsDue = (allWords: Word[], userProgress: Record<string, SRSProgress>) => {
  const now = Date.now();
  return allWords.filter(word => {
    const id = getWordId(word);
    const progress = userProgress[id];
    // If no progress, it's new (not due unless we pull new cards)
    // If progress exists, check due date
    return progress && progress.dueDate <= now;
  });
};

export const getNewWords = (allWords: Word[], userProgress: Record<string, SRSProgress>, limit: number = 5) => {
  return allWords.filter(word => !userProgress[getWordId(word)]).slice(0, limit);
};
