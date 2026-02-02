'use client';

import { RoundState } from '@/lib/game';

interface ScoreDisplayProps {
  rounds: RoundState[];
  currentRound: number;
}

export default function ScoreDisplay({ rounds, currentRound }: ScoreDisplayProps) {
  const totalScore = rounds.reduce((sum, r) => sum + r.points, 0);
  
  return (
    <div className="relative z-10 px-6 py-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Round dots */}
        <div className="flex gap-2">
          {rounds.map((round, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-all duration-500
                ${i === currentRound ? 'w-6 rounded-full' : ''}
                ${round.status === 'correct' ? 'bg-emerald-500' : ''}
                ${round.status === 'wrong' || round.status === 'timeout' ? 'bg-red-500/50' : ''}
                ${round.status === 'revealing' ? 'bg-[#D4AF37] animate-pulse' : ''}
                ${round.status === 'guessing' && i !== currentRound ? 'bg-zinc-800' : ''}
              `}
            />
          ))}
        </div>
        
        {/* Score */}
        <div className="text-right">
          <span className="font-display text-2xl text-gold-gradient">{totalScore}</span>
          <span className="text-zinc-600 text-sm ml-1">/500</span>
        </div>
      </div>
    </div>
  );
}
