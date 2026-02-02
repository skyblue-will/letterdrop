'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  const remainingLetters = 5 - revealedCount;
  const canSubmit = userInput.length === remainingLetters;
  
  // Keep input focused during gameplay
  const focusInput = useCallback(() => {
    if (status === 'revealing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  useEffect(() => {
    focusInput();
  }, [focusInput, revealedCount]);

  // Refocus on any touch/click in the game area
  useEffect(() => {
    if (status !== 'revealing') return;
    
    const handleTouch = (e: Event) => {
      // Don't refocus if tapping the submit button
      if ((e.target as HTMLElement).closest('[data-submit]')) return;
      setTimeout(focusInput, 10);
    };
    
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('click', handleTouch);
    
    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('click', handleTouch);
    };
  }, [status, focusInput]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'revealing') return;
    
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (value.length <= remainingLetters) {
      onInputChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      onSubmit();
    }
  };

  // Prevent blur on mobile
  const handleBlur = () => {
    if (status === 'revealing' && !canSubmit) {
      setTimeout(focusInput, 50);
    }
  };

  const handleSubmitClick = () => {
    if (canSubmit) {
      onSubmit();
    }
  };

  const getLetterStyle = (index: number) => {
    const isRevealed = index < revealedCount;
    const userLetterIndex = index - revealedCount;
    const hasUserLetter = userLetterIndex >= 0 && userLetterIndex < userInput.length;
    const isNextEmpty = userLetterIndex === userInput.length;
    
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
    if (isNextEmpty && status === 'revealing') {
      return `${base} glass text-zinc-700 border border-[#D4AF37]/30`;
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
      {/* Hidden input for keyboard */}
      {status === 'revealing' && (
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          maxLength={remainingLetters}
          className="
            w-full max-w-[280px] sm:max-w-[320px]
            bg-transparent text-center text-transparent
            caret-[#D4AF37]
            text-2xl font-display tracking-[0.5em]
            outline-none
            h-0 overflow-hidden
          "
          style={{ 
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'auto',
          }}
        />
      )}
      
      {/* Letter tiles */}
      <div 
        className="flex gap-3 cursor-pointer"
        onClick={focusInput}
      >
        {letters.map((_, i) => (
          <div 
            key={i} 
            className={getLetterStyle(i)}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {getDisplayLetter(i)}
          </div>
        ))}
      </div>

      {/* Submit button / typing hint */}
      {status === 'revealing' && (
        <div className="h-14 flex items-center justify-center">
          {canSubmit ? (
            <button 
              data-submit
              onClick={handleSubmitClick}
              className="
                px-8 py-3 rounded-xl
                glass-gold text-[#D4AF37] font-display tracking-wide
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                animate-fade-in
              "
            >
              Submit
            </button>
          ) : (
            <button 
              onClick={focusInput}
              className="text-xs tracking-[0.2em] text-zinc-500 uppercase px-4 py-2 rounded-lg active:bg-zinc-800/50 transition-colors"
            >
              {userInput.length === 0 
                ? 'Tap to type' 
                : `${userInput.length} of ${remainingLetters}`
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}
