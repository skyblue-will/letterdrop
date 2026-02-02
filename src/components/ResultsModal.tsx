'use client';

import { GameState, Stats } from '@/lib/game';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  stats: Stats;
  onShare: () => void;
  onPlayAgain: () => void;
}

export default function ResultsModal({
  isOpen,
  onClose,
  gameState,
  stats,
  onShare,
  onPlayAgain,
}: ResultsModalProps) {
  if (!isOpen) return null;

  const getScoreMessage = () => {
    if (gameState.totalScore >= 450) return 'Legendary';
    if (gameState.totalScore >= 350) return 'Brilliant';
    if (gameState.totalScore >= 250) return 'Well played';
    if (gameState.totalScore >= 150) return 'Not bad';
    return 'Keep practicing';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="glass rounded-3xl max-w-sm w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-white/5">
          <div className="font-display text-6xl text-gold-gradient mb-2">
            {gameState.totalScore}
          </div>
          <div className="text-zinc-600 text-sm">out of 500</div>
          <div className="font-display text-xl text-white mt-4">{getScoreMessage()}</div>
        </div>

        {/* Round breakdown */}
        <div className="p-6 border-b border-white/5">
          <div className="space-y-3">
            {gameState.rounds.map((round, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${round.status === 'correct' ? 'bg-emerald-500' : 'bg-red-500/50'}
                  `} />
                  <span className="font-mono text-sm text-zinc-400">{round.word}</span>
                </div>
                <div className="flex items-center gap-3">
                  {round.status === 'correct' && (
                    <span className="text-xs text-zinc-600">
                      @{round.revealedCount}
                    </span>
                  )}
                  <span className={`
                    font-display text-sm
                    ${round.points > 0 ? 'text-emerald-400' : 'text-red-400/50'}
                  `}>
                    +{round.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-white/5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-xl text-white">{stats.gamesPlayed}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Played</div>
            </div>
            <div>
              <div className="font-display text-xl text-[#D4AF37]">{stats.bestScore}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Best</div>
            </div>
            <div>
              <div className="font-display text-xl text-white">{stats.currentStreak}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Streak</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={onShare}
            className="
              w-full py-4 rounded-xl
              glass-gold text-[#D4AF37] font-display tracking-wide
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-300
            "
          >
            Share Result
          </button>
          
          <button
            onClick={onPlayAgain}
            className="
              w-full py-4 rounded-xl
              glass text-zinc-400 font-display tracking-wide
              hover:text-white hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-300
            "
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
