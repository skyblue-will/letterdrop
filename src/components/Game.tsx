'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  GameMode, 
  RoundState,
  Stats,
  getPointsForReveal,
  loadStats,
  saveStats,
  updateStats,
  loadDailyState,
  saveDailyState,
  generateShareText,
} from '@/lib/game';
import { getPuzzleNumber, getWordsForPuzzle, getRandomWord } from '@/lib/words';
import WordDisplay from './WordDisplay';
import ScoreDisplay from './ScoreDisplay';
import ResultsModal from './ResultsModal';
import ModeSelector from './ModeSelector';

const REVEAL_INTERVAL = 3500;

export default function Game() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
    
    const puzzleNumber = getPuzzleNumber();
    const savedDaily = loadDailyState(puzzleNumber);
    
    if (savedDaily && savedDaily.gameStatus === 'finished') {
      setDailyCompleted(true);
      setGameState(savedDaily);
    }
  }, []);

  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (!currentRound || currentRound.status !== 'revealing') return;
    
    if (currentRound.revealedCount >= 5) {
      setGameState(prev => {
        if (!prev) return prev;
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRound] = {
          ...newRounds[prev.currentRound],
          status: 'timeout',
          points: 0,
        };
        return { ...prev, rounds: newRounds };
      });
      return;
    }

    revealTimerRef.current = setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        const newRounds = [...prev.rounds];
        newRounds[prev.currentRound] = {
          ...newRounds[prev.currentRound],
          revealedCount: newRounds[prev.currentRound].revealedCount + 1,
        };
        return { ...prev, rounds: newRounds };
      });
      setUserInput('');
    }, REVEAL_INTERVAL);

    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (!currentRound) return;
    
    if (currentRound.status === 'correct' || currentRound.status === 'wrong' || currentRound.status === 'timeout') {
      const timer = setTimeout(() => {
        if (gameState.currentRound >= 4) {
          const totalScore = gameState.rounds.reduce((sum, r) => sum + r.points, 0);
          const finalState = {
            ...gameState,
            totalScore,
            gameStatus: 'finished' as const,
          };
          setGameState(finalState);
          
          if (gameState.mode === 'daily') {
            saveDailyState(finalState);
            setDailyCompleted(true);
          }
          
          if (stats) {
            const newStats = updateStats(stats, totalScore, gameState.puzzleNumber, gameState.mode, gameState.rounds);
            setStats(newStats);
            saveStats(newStats);
          }
          
          setTimeout(() => setShowResults(true), 500);
        } else {
          setGameState(prev => {
            if (!prev) return prev;
            const newRounds = [...prev.rounds];
            newRounds[prev.currentRound + 1] = {
              ...newRounds[prev.currentRound + 1],
              status: 'revealing',
              revealedCount: 1,
            };
            return {
              ...prev,
              currentRound: prev.currentRound + 1,
              rounds: newRounds,
            };
          });
          setUserInput('');
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, stats]);

  const startGame = useCallback((mode: GameMode) => {
    const puzzleNumber = mode === 'daily' ? getPuzzleNumber() : Math.floor(Math.random() * 10000);
    const words = mode === 'daily' 
      ? getWordsForPuzzle(puzzleNumber)
      : Array(5).fill(null).map(() => getRandomWord());
    
    const rounds: RoundState[] = words.map((word, i) => ({
      word,
      revealedCount: i === 0 ? 1 : 0,
      status: i === 0 ? 'revealing' : 'guessing',
      guess: '',
      points: 0,
    }));

    setGameState({
      mode,
      puzzleNumber,
      rounds,
      currentRound: 0,
      totalScore: 0,
      gameStatus: 'playing',
    });
    setShowResults(false);
    setUserInput('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (currentRound.status !== 'revealing') return;
    
    const revealedPart = currentRound.word.slice(0, currentRound.revealedCount);
    const fullGuess = revealedPart + userInput;
    
    if (fullGuess.length !== 5) return;
    
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }
    
    const isCorrect = fullGuess.toUpperCase() === currentRound.word;
    const points = isCorrect ? getPointsForReveal(currentRound.revealedCount) : 0;
    
    setGameState(prev => {
      if (!prev) return prev;
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRound] = {
        ...newRounds[prev.currentRound],
        status: isCorrect ? 'correct' : 'wrong',
        guess: fullGuess.toUpperCase(),
        points,
      };
      return { ...prev, rounds: newRounds };
    });
    
    if (isCorrect) {
      const messages = ['Incredible', 'Amazing', 'Great', 'Nice', 'Close call'];
      setToast(`${messages[currentRound.revealedCount - 1]} +${points}`);
    } else {
      setToast(`${currentRound.word}`);
    }
    setTimeout(() => setToast(null), 1500);
  }, [gameState, userInput]);

  const handleShare = async () => {
    if (!gameState) return;
    
    const text = generateShareText(gameState.totalScore, gameState.puzzleNumber, gameState.rounds);
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast('Copied');
        setTimeout(() => setToast(null), 1500);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-gold-gradient font-display text-2xl animate-pulse">Letterdrop</div>
      </div>
    );
  }

  const currentRound = gameState?.rounds[gameState.currentRound];

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden texture-noise">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-zinc-900/80 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="w-10" />
          <div className="text-center">
            <h1 className="font-display text-2xl tracking-wide text-gold-gradient">
              Letterdrop
            </h1>
            {stats && stats.currentStreak > 0 && (
              <div className="text-xs text-zinc-500 tracking-widest uppercase mt-1">
                {stats.currentStreak} day streak
              </div>
            )}
          </div>
          <button
            onClick={() => gameState && setShowResults(true)}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            disabled={!gameState}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      {!gameState || gameState.gameStatus === 'finished' ? (
        <ModeSelector 
          onSelectMode={startGame}
          dailyCompleted={dailyCompleted}
          stats={stats}
        />
      ) : (
        <>
          <ScoreDisplay 
            rounds={gameState.rounds}
            currentRound={gameState.currentRound}
          />

          <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-8">
            {currentRound && (
              <>
                <div className="text-xs tracking-[0.3em] text-zinc-600 uppercase">
                  Round {gameState.currentRound + 1} of 5
                </div>

                <WordDisplay 
                  word={currentRound.word}
                  revealedCount={currentRound.revealedCount}
                  status={currentRound.status}
                  userInput={userInput}
                  onInputChange={setUserInput}
                  onSubmit={handleSubmit}
                />

                {currentRound.status === 'revealing' && (
                  <div className="text-center animate-fade-in">
                    <div className="font-display text-5xl text-gold-gradient animate-pulse-gold">
                      {getPointsForReveal(currentRound.revealedCount)}
                    </div>
                    <div className="text-xs tracking-[0.2em] text-zinc-500 uppercase mt-2">
                      points available
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="glass-gold px-8 py-4 rounded-2xl">
            <span className="font-display text-xl text-gold-gradient">{toast}</span>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {stats && gameState && (
        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          gameState={gameState}
          stats={stats}
          onShare={handleShare}
          onPlayAgain={() => startGame('practice')}
        />
      )}
    </div>
  );
}
