import React, { useState } from 'react';
import { X, Trophy, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { INITIAL_ACHIEVEMENTS } from '../game/constants';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';

interface AchievementsModalProps {
  unlockedMap: Record<string, { unlocked: boolean; unlockedAt?: number }>;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedMap,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const lang = i18n.getLanguage();

  const totalCount = INITIAL_ACHIEVEMENTS.length;
  const unlockedCount = INITIAL_ACHIEVEMENTS.filter((a) => unlockedMap[a.id]?.unlocked).length;

  const filteredList = INITIAL_ACHIEVEMENTS.filter((item) => {
    const isUnlocked = !!unlockedMap[item.id]?.unlocked;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div
      id="achievements-modal"
      className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md z-30 select-none"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black text-white uppercase font-['Chakra_Petch'] tracking-wider">
              {i18n.t('achievements')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-purple-400 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
              {unlockedCount} / {totalCount}
            </span>

            <button
              id="btn-close-achievements"
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => {
              sound.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'id' ? 'Semua' : 'All'} ({totalCount})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('unlocked');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'id' ? 'Terbuka' : 'Unlocked'} ({unlockedCount})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilter('locked');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filter === 'locked'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'id' ? 'Terkunci' : 'Locked'} ({totalCount - unlockedCount})
          </button>
        </div>

        {/* List of achievements */}
        <div className="overflow-y-auto pr-1 my-1 space-y-2.5 max-h-[58vh]">
          {filteredList.map((item) => {
            const isUnlocked = !!unlockedMap[item.id]?.unlocked;

            return (
              <div
                key={item.id}
                id={`achievement-card-${item.id}`}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-purple-500/20 border border-purple-500/40'
                      : 'bg-slate-800/60 border border-slate-700/50'
                  }`}
                >
                  {isUnlocked ? item.icon : <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white font-['Chakra_Petch'] tracking-wide truncate">
                      {item.title}
                    </h3>
                    {isUnlocked && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0 ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {i18n.t('unlocked')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
