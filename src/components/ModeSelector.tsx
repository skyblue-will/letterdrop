'use client';

import { GameMode, Stats, isStreakAtRisk } from '@/lib/game';
import { getPuzzleNumber } from '@/lib/words';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  dailyCompleted: boolean;
  stats: Stats | null;
}

export default function ModeSelector({ onSelectMode, dailyCompleted, stats }: ModeSelectorProps) {
  const puzzleNumber = getPuzzleNumber();
  const streakAtRisk = stats ? isStreakAtRisk(stats) : false;
  
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-12 animate-fade-in">
      {/* Streak at risk warning */}
      {streakAtRisk && stats && stats.currentStreak > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-pulse">
          <div className="glass-gold px-6 py-3 rounded-full flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-[#D4AF37] font-display text-sm">
              {stats.currentStreak} day streak at risk!
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl sm:text-5xl text-gold-gradient">
          Letterdrop
        </h2>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto leading-relaxed">
          Letters reveal one by one. Guess early for more points — if you dare.
        </p>
      </div>

      {/* Stats preview */}
      {stats && stats.gamesPlayed > 0 && (
        <div className="flex gap-8 text-center">
          <div>
            <div className="font-display text-2xl text-white">{stats.bestScore}</div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest">Best</div>
          </div>
          <div>
            <div className="font-display text-2xl text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest">Played</div>
          </div>
          <div className="relative">
            {stats.currentStreak > 0 && (
              <span className="absolute -top-1 -right-4 text-lg">🔥</span>
            )}
            <div className={`font-display text-2xl ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-[#D4AF37]'}`}>
              {stats.currentStreak}
            </div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest">Streak</div>
          </div>
        </div>
      )}

      {/* Mode buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelectMode('daily')}
          disabled={dailyCompleted}
          className={`
            relative py-5 px-8 rounded-2xl font-display text-lg tracking-wide
            transition-all duration-300
            ${dailyCompleted 
              ? 'glass text-zinc-600 cursor-not-allowed'
              : 'glass-gold text-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] animate-glow'
            }
          `}
        >
          {dailyCompleted ? (
            <>
              <span className="opacity-50">Daily Complete</span>
              <span className="block text-xs text-zinc-700 mt-1">Come back tomorrow</span>
            </>
          ) : (
            <>
              Daily Challenge
              <span className="block text-xs text-[#D4AF37]/60 mt-1">№{puzzleNumber}</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => onSelectMode('practice')}
          className="
            py-5 px-8 rounded-2xl font-display text-lg tracking-wide
            glass text-zinc-400
            hover:text-white hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-300
          "
        >
          Practice
          <span className="block text-xs text-zinc-600 mt-1">Unlimited rounds</span>
        </button>
      </div>

      {/* How to play - minimal */}
      <div className="text-center text-xs text-zinc-700 max-w-xs space-y-1">
        <p>5 words · Letters reveal every 3.5s</p>
        <p>Early guess = more points · Max 500</p>
      </div>
    </main>
  );
}
