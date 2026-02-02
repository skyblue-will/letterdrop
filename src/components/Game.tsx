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

const REVEAL_INTERVAL = 3500; // 3.5 seconds between letter reveals

export default function Game() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
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

  // Auto-reveal letters
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (!currentRound || currentRound.status !== 'revealing') return;
    
    if (currentRound.revealedCount >= 5) {
      // All letters revealed - mark as timeout/wrong
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
      // Clear user input when new letter reveals (they might need to rethink)
      setUserInput('');
    }, REVEAL_INTERVAL);

    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, [gameState]);

  // Handle round completion
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (!currentRound) return;
    
    if (currentRound.status === 'correct' || currentRound.status === 'wrong' || currentRound.status === 'timeout') {
      // Wait a moment then move to next round or finish
      const timer = setTimeout(() => {
        if (gameState.currentRound >= 4) {
          // Game finished
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
          
          // Update stats
          if (stats) {
            const newStats = updateStats(stats, totalScore, gameState.puzzleNumber, gameState.mode, gameState.rounds);
            setStats(newStats);
            saveStats(newStats);
          }
          
          setTimeout(() => setShowResults(true), 500);
        } else {
          // Next round
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

  // Start a new game
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

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const currentRound = gameState.rounds[gameState.currentRound];
    if (currentRound.status !== 'revealing') return;
    
    // Build full guess from revealed + user input
    const revealedPart = currentRound.word.slice(0, currentRound.revealedCount);
    const fullGuess = revealedPart + userInput;
    
    if (fullGuess.length !== 5) return;
    
    // Clear the reveal timer
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
      const messages = ['🔥 INCREDIBLE!', '⭐ AMAZING!', '✨ GREAT!', '👍 NICE!', '😅 PHEW!'];
      setToast(messages[currentRound.revealedCount - 1] + ` +${points}`);
    } else {
      setToast(`❌ It was ${currentRound.word}`);
    }
    setTimeout(() => setToast(null), 1500);
  }, [gameState, userInput]);

  // Share results
  const handleShare = async () => {
    if (!gameState) return;
    
    const text = generateShareText(gameState.totalScore, gameState.puzzleNumber, gameState.rounds);
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast('Copied to clipboard!');
        setTimeout(() => setToast(null), 1500);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-zinc-900 flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  const currentRound = gameState?.rounds[gameState.currentRound];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="py-3 px-4 border-b border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="w-10" />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              LETTERDROP
            </h1>
            {stats && (
              <div className="text-xs text-zinc-500">
                🔥 {stats.currentStreak} • Best: {stats.bestScore}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowResults(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg"
            disabled={!gameState}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mode Selector */}
      {!gameState || gameState.gameStatus === 'finished' ? (
        <ModeSelector 
          onSelectMode={startGame}
          dailyCompleted={dailyCompleted}
        />
      ) : (
        <>
          {/* Score Display */}
          <ScoreDisplay 
            rounds={gameState.rounds}
            currentRound={gameState.currentRound}
          />

          {/* Main Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
            {currentRound && (
              <>
                {/* Round indicator */}
                <div className="text-sm text-zinc-500">
                  Round {gameState.currentRound + 1} of 5
                </div>

                {/* Word Display with inline input */}
                <WordDisplay 
                  word={currentRound.word}
                  revealedCount={currentRound.revealedCount}
                  status={currentRound.status}
                  userInput={userInput}
                  onInputChange={setUserInput}
                  onSubmit={handleSubmit}
                />

                {/* Points indicator */}
                {currentRound.status === 'revealing' && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400">
                      {getPointsForReveal(currentRound.revealedCount)}
                    </div>
                    <div className="text-sm text-zinc-500">points if correct</div>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white text-black px-6 py-3 rounded-xl font-bold shadow-lg animate-bounce">
            {toast}
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
