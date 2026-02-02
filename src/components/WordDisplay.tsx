'use client';

import { RoundStatus } from '@/lib/game';

interface WordDisplayProps {
  word: string;
  revealedCount: number;
  status: RoundStatus;
}

export default function WordDisplay({ word, revealedCount, status }: WordDisplayProps) {
  const letters = word.split('');
  
  const getLetterStyle = (index: number) => {
    const isRevealed = index < revealedCount;
    const baseStyle = `
      w-14 h-14 sm:w-16 sm:h-16
      flex items-center justify-center
      text-2xl sm:text-3xl font-bold uppercase
      rounded-lg
      transition-all duration-300
    `;
    
    if (status === 'correct') {
      return `${baseStyle} bg-green-500 text-white scale-105`;
    }
    if (status === 'wrong' || status === 'timeout') {
      return `${baseStyle} bg-red-500/80 text-white`;
    }
    if (isRevealed) {
      return `${baseStyle} bg-yellow-500 text-black animate-pop`;
    }
    return `${baseStyle} bg-zinc-800 text-zinc-600 border-2 border-zinc-700`;
  };

  return (
    <div className="flex gap-2">
      {letters.map((letter, i) => (
        <div 
          key={i} 
          className={getLetterStyle(i)}
          style={{ 
            animationDelay: `${i * 50}ms`,
          }}
        >
          {i < revealedCount || status === 'correct' || status === 'wrong' || status === 'timeout' 
            ? letter 
            : '?'
          }
        </div>
      ))}
    </div>
  );
}
