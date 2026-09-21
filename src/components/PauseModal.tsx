import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';

interface PauseModalProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  soundEnabled,
  musicEnabled,
  onResume,
  onRestart,
  onQuit,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div
      id="pause-modal"
      className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md z-30 select-none"
    >
      <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">
          SYSTEM HOLD
        </div>

        <h2 className="text-3xl font-black text-white font-['Chakra_Petch'] uppercase tracking-wider mb-6">
          {i18n.t('gamePaused')}
        </h2>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            id="btn-resume"
            type="button"
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-black text-base tracking-wider uppercase font-['Chakra_Petch'] shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{i18n.t('resume')}</span>
          </button>

          {/* Restart */}
          <button
            id="btn-pause-restart"
            type="button"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm tracking-wider uppercase font-['Chakra_Petch'] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{i18n.t('restart')}</span>
          </button>

          {/* Quit to menu */}
          <button
            id="btn-pause-quit"
            type="button"
            onClick={() => {
              sound.playClick();
              onQuit();
            }}
            className="w-full py-2.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm tracking-wider uppercase font-['Chakra_Petch'] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{i18n.t('menu')}</span>
          </button>
        </div>

        {/* Audio quick toggles in pause */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800 w-full justify-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleMusic();
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              musicEnabled
                ? 'bg-slate-800 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
