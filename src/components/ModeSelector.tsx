'use client';

import { GameMode } from '@/lib/game';
import { getPuzzleNumber } from '@/lib/words';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  dailyCompleted: boolean;
}

export default function ModeSelector({ onSelectMode, dailyCompleted }: ModeSelectorProps) {
  const puzzleNumber = getPuzzleNumber();
  
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
      {/* Logo / Intro */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
          LETTERDROP
        </h2>
        <p className="text-zinc-400 max-w-xs">
          Watch letters reveal. Guess early for more points. Risk it all or play it safe.
        </p>
      </div>

      {/* How to play */}
      <div className="bg-zinc-800/50 rounded-xl p-4 max-w-sm">
        <h3 className="font-bold text-yellow-400 mb-2">HOW TO PLAY</h3>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>📝 5 words, revealed one letter at a time</li>
          <li>⚡ Guess early = more points (100→80→60→40→20)</li>
          <li>❌ Wrong guess = 0 points, word revealed</li>
          <li>🎯 Max score: 500 points</li>
        </ul>
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => onSelectMode('daily')}
          disabled={dailyCompleted}
          className={`
            py-4 px-6 rounded-xl font-bold text-lg
            transition-all
            ${dailyCompleted 
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 active:scale-95'
            }
          `}
        >
          {dailyCompleted ? (
            <span>✓ Daily #{puzzleNumber} Complete</span>
          ) : (
            <span>📅 Daily #{puzzleNumber}</span>
          )}
        </button>
        
        <button
          onClick={() => onSelectMode('practice')}
          className="
            py-4 px-6 rounded-xl font-bold text-lg
            bg-zinc-700 text-white
            hover:bg-zinc-600 hover:scale-105 active:scale-95
            transition-all
          "
        >
          🎯 Practice Mode
        </button>
      </div>
    </main>
  );
}
