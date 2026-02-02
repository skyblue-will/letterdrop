'use client';

import { useEffect, useRef } from 'react';
import { RoundStatus } from '@/lib/game';

interface WordDisplayProps {
  word: string;
  revealedCount: number;
  status: RoundStatus;
  userInput: string;
  onInputChange: (input: string) => void;
  onSubmit: () => void;
}

export default function WordDisplay({ 
  word, 
  revealedCount, 
  status, 
  userInput,
  onInputChange,
  onSubmit
}: WordDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const letters = word.split('');
  
  useEffect(() => {
    if (status === 'revealing') {
      inputRef.current?.focus();
    }
  }, [status, revealedCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (status !== 'revealing') return;
    
    if (e.key === 'Enter' && userInput.length === 5 - revealedCount) {
      onSubmit();
      return;
    }
    
    if (e.key === 'Backspace') {
      onInputChange(userInput.slice(0, -1));
      return;
    }
    
    if (/^[a-zA-Z]$/.test(e.key) && userInput.length < 5 - revealedCount) {
      const newInput = userInput + e.key.toUpperCase();
      onInputChange(newInput);
      
      if (newInput.length === 5 - revealedCount) {
        setTimeout(() => onSubmit(), 150);
      }
    }
  };

  const getLetterStyle = (index: number) => {
    const isRevealed = index < revealedCount;
    const userLetterIndex = index - revealedCount;
    const hasUserLetter = userLetterIndex >= 0 && userLetterIndex < userInput.length;
    
    const base = `
      w-14 h-14 sm:w-16 sm:h-16
      flex items-center justify-center
      text-2xl sm:text-3xl font-display uppercase
      rounded-xl
      transition-all duration-300
    `;
    
    if (status === 'correct') {
      return `${base} bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`;
    }
    if (status === 'wrong' || status === 'timeout') {
      return `${base} bg-red-500/10 text-red-400/80 border border-red-500/20`;
    }
    if (isRevealed) {
      return `${base} glass-gold text-[#D4AF37] animate-pop`;
    }
    if (hasUserLetter) {
      return `${base} glass text-white border-zinc-500/50`;
    }
    return `${base} glass text-zinc-700`;
  };

  const getDisplayLetter = (index: number) => {
    if (status === 'correct' || status === 'wrong' || status === 'timeout') {
      return letters[index];
    }
    if (index < revealedCount) {
      return letters[index];
    }
    const userLetterIndex = index - revealedCount;
    if (userLetterIndex >= 0 && userLetterIndex < userInput.length) {
      return userInput[userLetterIndex];
    }
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-10"
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCapitalize="characters"
        value={userInput}
        onChange={() => {}}
      />
      
      <div 
        className="flex gap-3 cursor-pointer"
        onClick={() => inputRef.current?.focus()}
      >
        {letters.map((letter, i) => (
          <div 
            key={i} 
            className={getLetterStyle(i)}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {getDisplayLetter(i)}
          </div>
        ))}
      </div>

      {status === 'revealing' && (
        <div className="text-xs tracking-[0.2em] text-zinc-600 uppercase">
          {userInput.length === 0 
            ? 'Tap to type' 
            : `${userInput.length} of ${5 - revealedCount}`
          }
        </div>
      )}
    </div>
  );
}
