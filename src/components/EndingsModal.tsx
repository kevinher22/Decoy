import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Lock, Play, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { i18n } from '../services/i18n';
import { storage } from '../services/storage';
import { GAME_ENDINGS } from '../data/storyData';
import { GameEnding, EndingId } from '../types';

export interface EndingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayEnding?: (ending: GameEnding) => void;
  onViewEndingCutscene?: (ending: GameEnding) => void;
  onPlayFinalStoryCutscene?: () => void;
}

export const EndingsModal: React.FC<EndingsModalProps> = ({
  isOpen,
  onClose,
  onReplayEnding,
  onViewEndingCutscene,
  onPlayFinalStoryCutscene,
}) => {
  const [selectedEnding, setSelectedEnding] = useState<GameEnding | null>(null);
  const lang = i18n.getLanguage();

  if (!isOpen) return null;

  const handleTriggerReplay = (ending: GameEnding) => {
    if (onViewEndingCutscene) {
      onViewEndingCutscene(ending);
    } else if (onReplayEnding) {
      onReplayEnding(ending);
    }
  };

  const storyState = storage.getStoryState();
  const unlockedIds = storyState.unlockedEndings;
  const unlockedCount = unlockedIds.length;
  const totalCount = GAME_ENDINGS.length;

  return (
    <div
      id="modal-endings-tracker"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 flex items-center gap-2">
                {lang === 'id' ? 'ARSIP AKHIR KISAH' : 'ENDINGS ARCHIVE'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
                  {unlockedCount} / {totalCount} {lang === 'id' ? 'TERBUKA' : 'UNLOCKED'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'id'
                  ? 'Kumpulkan seluruh 7 akhir kisah untuk mengungkap rahasia terdalam.'
                  : 'Uncover all 7 distinct endings to reveal the ultimate mystery.'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-endings-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>

        {/* All 7 Endings Conquered Banner */}
        {unlockedCount >= totalCount && onPlayFinalStoryCutscene && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-cyan-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-amber-300 uppercase tracking-wide">
                  {lang === 'id' ? 'KONVERGENSI LENGKAP // SELURUH ENDING TERBUKA' : 'THE FULL CONVERGENCE // ALL ENDINGS UNLOCKED'}
                </h4>
                <p className="text-xs text-slate-300">
                  {lang === 'id'
                    ? 'Saksikan rahasia akhir yang menghubungkan ketujuh akhir kisah.'
                    : 'Watch the ultimate cinematic connecting all seven storylines.'}
                </p>
              </div>
            </div>

            <button
              id="btn-play-final-cutscene-from-endings"
              type="button"
              onClick={onPlayFinalStoryCutscene}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{i18n.t('replayFinalCutscene')}</span>
            </button>
          </div>
        )}

        {/* Grid of Endings */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {GAME_ENDINGS.map((ending) => {
            const isUnlocked = unlockedIds.includes(ending.id);
            const isTrueEnding = ending.id === 'ending_07';

            return (
              <div
                key={ending.id}
                id={`ending-card-${ending.id}`}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? isTrueEnding
                      ? 'bg-gradient-to-br from-amber-950/30 to-purple-950/40 border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : 'bg-slate-900/60 border-slate-750 hover:border-slate-600'
                    : 'bg-slate-950/50 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
                      {isUnlocked ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      ENDING #{ending.number}
                    </span>

                    {isTrueEnding && isUnlocked && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> TRUE ENDING
                      </span>
                    )}

                    {!isUnlocked && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                        {lang === 'id' ? 'TERKUNCI' : 'LOCKED'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-lg font-bold font-mono mb-1 ${
                      isUnlocked
                        ? isTrueEnding
                          ? 'text-amber-300'
                          : 'text-slate-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {isUnlocked
                      ? lang === 'id'
                        ? ending.title.id
                        : ending.title.en
                      : '???'}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs font-sans text-slate-400 mb-3">
                    {isUnlocked
                      ? lang === 'id'
                        ? ending.subtitle.id
                        : ending.subtitle.en
                      : lang === 'id'
                      ? 'Kondisi belum terpenuhi dalam pelarian.'
                      : 'Conditions have not been met in the corridor.'}
                  </p>

                  {/* Excerpt / Hint */}
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800/60 mb-4 min-h-[4.2rem] flex items-center">
                    <p className="text-xs font-mono leading-relaxed text-slate-300">
                      {isUnlocked
                        ? `"${lang === 'id' ? (ending.description?.id || ending.shortDescription.id) : (ending.description?.en || ending.shortDescription.en)}"`
                        : `${lang === 'id' ? 'Petunjuk: ' : 'Hint: '} ${
                            lang === 'id'
                              ? (ending.hint?.id || ending.teaserHint.id)
                              : (ending.hint?.en || ending.teaserHint.en)
                          }`}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                {isUnlocked && (
                  <button
                    id={`btn-replay-ending-${ending.id}`}
                    onClick={() => handleTriggerReplay(ending)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-mono tracking-wider transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'id' ? 'PUTAR ULANG KISAH' : 'REPLAY ENDING'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{lang === 'id' ? 'STATUS KEPUTUSAN: AKTIF' : 'CHOICE ENGINE: ACTIVE'}</span>
          <span>DON'T BLINK PROTOCOL</span>
        </div>
      </motion.div>
    </div>
  );
};
