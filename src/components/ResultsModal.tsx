'use client';

import { GameState, Stats, POINTS_BY_REVEAL } from '@/lib/game';

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

  const scorePercentage = (gameState.totalScore / 500) * 100;
  
  const getScoreMessage = () => {
    if (gameState.totalScore >= 450) return '🔥 LEGENDARY!';
    if (gameState.totalScore >= 350) return '⭐ AMAZING!';
    if (gameState.totalScore >= 250) return '✨ GREAT!';
    if (gameState.totalScore >= 150) return '👍 NICE!';
    return '💪 KEEP GOING!';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-2xl max-w-sm w-full border border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-center">
          <div className="text-4xl font-bold text-black">{gameState.totalScore}</div>
          <div className="text-black/70">out of 500</div>
          <div className="text-2xl mt-1">{getScoreMessage()}</div>
        </div>

        {/* Round breakdown */}
        <div className="p-4">
          <h3 className="font-bold text-zinc-400 text-sm mb-2">ROUND BREAKDOWN</h3>
          <div className="space-y-2">
            {gameState.rounds.map((round, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`
                    w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                    ${round.status === 'correct' ? 'bg-green-500' : 'bg-red-500/50'}
                  `}>
                    {i + 1}
                  </span>
                  <span className="font-mono">{round.word}</span>
                </div>
                <div className="flex items-center gap-2">
                  {round.status === 'correct' && (
                    <span className="text-zinc-500 text-xs">
                      at {round.revealedCount} letter{round.revealedCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`font-bold ${round.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    +{round.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-800 rounded-lg p-2">
              <div className="text-xl font-bold">{stats.gamesPlayed}</div>
              <div className="text-xs text-zinc-500">Played</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-2">
              <div className="text-xl font-bold text-yellow-400">{stats.bestScore}</div>
              <div className="text-xs text-zinc-500">Best</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-2">
              <div className="text-xl font-bold text-orange-400">🔥 {stats.currentStreak}</div>
              <div className="text-xs text-zinc-500">Streak</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            onClick={onShare}
            className="
              w-full py-3
              bg-green-500 hover:bg-green-600
              text-white font-bold rounded-xl
              transition-colors flex items-center justify-center gap-2
            "
          >
            <span>SHARE</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          
          <button
            onClick={onPlayAgain}
            className="
              w-full py-3
              bg-zinc-700 hover:bg-zinc-600
              text-white font-bold rounded-xl
              transition-colors
            "
          >
            🎯 PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
