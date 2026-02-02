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
  
  // Focus input when revealing
  useEffect(() => {
    if (status === 'revealing') {
      inputRef.current?.focus();
    }
  }, [status, revealedCount]);

  // Handle keyboard input
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
      
      // Auto-submit when all letters filled
      if (newInput.length === 5 - revealedCount) {
        setTimeout(() => onSubmit(), 100);
      }
    }
  };

  const getLetterStyle = (index: number) => {
    const isRevealed = index < revealedCount;
    const userLetterIndex = index - revealedCount;
    const hasUserLetter = userLetterIndex >= 0 && userLetterIndex < userInput.length;
    
    const baseStyle = `
      w-12 h-12 sm:w-14 sm:h-14
      flex items-center justify-center
      text-2xl sm:text-3xl font-bold uppercase
      rounded-lg
      transition-all duration-200
    `;
    
    if (status === 'correct') {
      return `${baseStyle} bg-green-500 text-white scale-105`;
    }
    if (status === 'wrong' || status === 'timeout') {
      return `${baseStyle} bg-red-500/80 text-white`;
    }
    if (isRevealed) {
      return `${baseStyle} bg-yellow-500 text-black`;
    }
    if (hasUserLetter) {
      return `${baseStyle} bg-zinc-600 text-white border-2 border-yellow-500`;
    }
    return `${baseStyle} bg-zinc-800 text-zinc-600 border-2 border-zinc-700`;
  };

  const getDisplayLetter = (index: number) => {
    // Game over - show full word
    if (status === 'correct' || status === 'wrong' || status === 'timeout') {
      return letters[index];
    }
    // Revealed letter
    if (index < revealedCount) {
      return letters[index];
    }
    // User input
    const userLetterIndex = index - revealedCount;
    if (userLetterIndex >= 0 && userLetterIndex < userInput.length) {
      return userInput[userLetterIndex];
    }
    // Empty slot
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-10"
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCapitalize="characters"
        value={userInput}
        onChange={() => {}} // Controlled by onKeyDown
      />
      
      {/* Letter tiles */}
      <div 
        className="flex gap-2 cursor-pointer"
        onClick={() => inputRef.current?.focus()}
      >
        {letters.map((letter, i) => (
          <div 
            key={i} 
            className={getLetterStyle(i)}
          >
            {getDisplayLetter(i)}
          </div>
        ))}
      </div>

      {/* Typing hint */}
      {status === 'revealing' && (
        <div className="text-sm text-zinc-500">
          {userInput.length === 0 
            ? 'Type the missing letters...' 
            : `${userInput.length}/${5 - revealedCount} letters`
          }
        </div>
      )}
    </div>
  );
}
