'use client';

import { useState, useRef, useEffect } from 'react';

interface GuessInputProps {
  onGuess: (guess: string) => void;
}

export default function GuessInput({ onGuess }: GuessInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length === 5) {
      onGuess(input);
      setInput('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    setInput(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="TYPE YOUR GUESS"
        className="
          w-64 px-4 py-3
          bg-zinc-800 border-2 border-zinc-600
          rounded-xl text-center text-xl font-bold tracking-widest
          focus:outline-none focus:border-yellow-500
          placeholder:text-zinc-600 placeholder:text-sm placeholder:tracking-normal
        "
        autoComplete="off"
        autoCapitalize="characters"
      />
      <button
        type="submit"
        disabled={input.length !== 5}
        className="
          px-8 py-3
          bg-gradient-to-r from-yellow-500 to-orange-500
          text-black font-bold rounded-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 transition-transform
          active:scale-95
        "
      >
        GUESS ({input.length}/5)
      </button>
    </form>
  );
}
