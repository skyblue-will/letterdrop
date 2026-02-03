export type GameMode = 'daily' | 'practice';
export type RoundStatus = 'revealing' | 'guessing' | 'correct' | 'wrong' | 'timeout';

export interface RoundState {
  word: string;
  revealedCount: number;
  status: RoundStatus;
  guess: string;
  points: number;
}

export interface GameState {
  mode: GameMode;
  puzzleNumber: number;
  rounds: RoundState[];
  currentRound: number;
  totalScore: number;
  gameStatus: 'playing' | 'finished';
}

export interface Stats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  perfectRounds: number; // Guessed at letter 1 or 2
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  lastCompletedPuzzle: number | null;
  averageScore: number;
  scoreHistory: number[]; // Last 10 scores
}

// Points based on when you guess
export const POINTS_BY_REVEAL = [100, 80, 60, 40, 20];

export function getPointsForReveal(revealedCount: number): number {
  return POINTS_BY_REVEAL[revealedCount - 1] || 0;
}

// Default stats
export function getDefaultStats(): Stats {
  return {
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    perfectRounds: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    lastCompletedPuzzle: null,
    averageScore: 0,
    scoreHistory: [],
  };
}

// Load stats from localStorage
export function loadStats(): Stats {
  if (typeof window === 'undefined') return getDefaultStats();
  
  try {
    const saved = localStorage.getItem('letterdrop-stats');
    if (saved) {
      return { ...getDefaultStats(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return getDefaultStats();
}

// Save stats to localStorage
export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('letterdrop-stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

// Update stats after a game
export function updateStats(stats: Stats, score: number, puzzleNumber: number, mode: GameMode, rounds: RoundState[]): Stats {
  const today = new Date().toISOString().split('T')[0];
  const newStats = { ...stats };
  
  newStats.gamesPlayed += 1;
  newStats.totalScore += score;
  newStats.bestScore = Math.max(newStats.bestScore, score);
  
  // Count perfect rounds (guessed at 1 or 2 letters revealed)
  const perfectCount = rounds.filter(r => r.status === 'correct' && r.revealedCount <= 2).length;
  newStats.perfectRounds += perfectCount;
  
  // Update score history (keep last 10)
  newStats.scoreHistory = [...newStats.scoreHistory, score].slice(-10);
  newStats.averageScore = Math.round(
    newStats.scoreHistory.reduce((a, b) => a + b, 0) / newStats.scoreHistory.length
  );
  
  // Streak tracking (daily mode only)
  if (mode === 'daily') {
    newStats.lastPlayedDate = today;
    newStats.lastCompletedPuzzle = puzzleNumber;
    
    // Check if continuing streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (stats.lastPlayedDate === yesterdayStr || stats.lastPlayedDate === null) {
      newStats.currentStreak += 1;
    } else if (stats.lastPlayedDate !== today) {
      newStats.currentStreak = 1;
    }
    newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
  }
  
  return newStats;
}

// Load daily game state
export function loadDailyState(puzzleNumber: number): GameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('letterdrop-daily');
    if (saved) {
      const state = JSON.parse(saved) as GameState;
      if (state.puzzleNumber === puzzleNumber) {
        return state;
      }
    }
  } catch (e) {
    console.error('Failed to load daily state:', e);
  }
  return null;
}

// Save daily game state
export function saveDailyState(state: GameState): void {
  if (typeof window === 'undefined') return;
  if (state.mode !== 'daily') return;
  
  try {
    localStorage.setItem('letterdrop-daily', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save daily state:', e);
  }
}

// Generate share text
export function generateShareText(score: number, puzzleNumber: number, rounds: RoundState[], streak?: number): string {
  const stars = rounds.map(r => {
    if (r.status !== 'correct') return '⬛';
    if (r.revealedCount === 1) return '🌟';
    if (r.revealedCount === 2) return '⭐';
    if (r.revealedCount === 3) return '✨';
    return '💫';
  }).join('');
  
  const streakText = streak && streak > 1 ? `\n🔥 ${streak} day streak` : '';
  
  return `Letterdrop #${puzzleNumber}\n${score}/500 ${stars}${streakText}\n\nhttps://letterdrop.vercel.app`;
}

// Check if streak is at risk (hasn't played today but has a streak)
export function isStreakAtRisk(stats: Stats): boolean {
  if (!stats.lastPlayedDate || stats.currentStreak === 0) return false;
  
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastPlayedDate === today) return false; // Already played today
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  return stats.lastPlayedDate === yesterdayStr; // Played yesterday, not today = at risk
}

// Get streak milestone message
export function getStreakMilestone(streak: number): string | null {
  const milestones: Record<number, string> = {
    3: '3 days! You\'re building a habit 🌱',
    7: 'One week! Unstoppable 🔥',
    14: 'Two weeks! You\'re hooked 💎',
    30: 'One month! Legendary status 👑',
    50: '50 days! Absolute machine 🚀',
    100: '100 DAYS! You are the game 🏆',
    365: 'ONE YEAR! Touch grass (tomorrow) 🌍',
  };
  return milestones[streak] || null;
}

// Get guess distribution from rounds
export function getGuessDistribution(stats: Stats, rounds: RoundState[]): number[] {
  // Distribution: index 0 = guessed at 1 letter, index 4 = guessed at 5 letters
  // This is a simplified version - in a full implementation you'd track this in stats
  const distribution = [0, 0, 0, 0, 0];
  
  rounds.forEach(round => {
    if (round.status === 'correct' && round.revealedCount >= 1 && round.revealedCount <= 5) {
      distribution[round.revealedCount - 1]++;
    }
  });
  
  return distribution;
}
