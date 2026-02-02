'use client';

import { RoundState } from '@/lib/game';

interface ScoreDisplayProps {
  rounds: RoundState[];
  currentRound: number;
}

export default function ScoreDisplay({ rounds, currentRound }: ScoreDisplayProps) {
  const totalScore = rounds.reduce((sum, r) => sum + r.points, 0);
  
  return (
    <div className="px-4 py-2 border-b border-zinc-800">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Round indicators */}
        <div className="flex gap-1">
          {rounds.map((round, i) => (
            <div
              key={i}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${i === currentRound ? 'ring-2 ring-yellow-500' : ''}
                ${round.status === 'correct' ? 'bg-green-500 text-white' : ''}
                ${round.status === 'wrong' || round.status === 'timeout' ? 'bg-red-500/50 text-white' : ''}
                ${round.status === 'revealing' ? 'bg-yellow-500 text-black' : ''}
                ${round.status === 'guessing' && i !== currentRound ? 'bg-zinc-800 text-zinc-600' : ''}
              `}
            >
              {round.status === 'correct' ? round.points : 
               round.status === 'wrong' || round.status === 'timeout' ? '0' :
               i + 1}
            </div>
          ))}
        </div>
        
        {/* Total score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
          <div className="text-xs text-zinc-500">/ 500</div>
        </div>
      </div>
    </div>
  );
}
