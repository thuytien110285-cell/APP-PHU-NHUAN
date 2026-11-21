import React, { useState } from 'react';
import { ArrowLeft, Gamepad2, Trophy } from 'lucide-react';
import contentData from '../data/contentData.json';
import { FlappyVoucherGame } from './games/FlappyVoucherGame';
import { SnakeChallengeGame } from './games/SnakeChallengeGame';

interface GamesHubProps {
  onBackToMenu: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onBackToMenu }) => {
  const [selectedGame, setSelectedGame] = useState<'flappy' | 'snake'>('flappy');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <button
        type="button"
        onClick={onBackToMenu}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003B73] hover:text-[#002855] mb-3 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại menu chính</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance">
            {contentData.gamesSection.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-2xl">
            {contentData.gamesSection.subtitle}
          </p>
        </div>

        {/* Game Switcher Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSelectedGame('flappy')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedGame === 'flappy'
                ? 'bg-white text-[#003B73] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game 1: Chờ vui – Nhận quà</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGame('snake')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedGame === 'snake'
                ? 'bg-white text-[#003B73] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Game 2: Rắn săn mồi</span>
          </button>
        </div>
      </div>

      {selectedGame === 'flappy' ? (
        <FlappyVoucherGame onBackToMenu={onBackToMenu} />
      ) : (
        <SnakeChallengeGame />
      )}
    </div>
  );
};
