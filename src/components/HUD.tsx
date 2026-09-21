import React from 'react';
import { Pause, Volume2, VolumeX, Music, Coins, Eye, EyeOff, Navigation } from 'lucide-react';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';

interface HUDProps {
  score: number;
  combo: number;
  multiplier: number;
  bestScore: number;
  coinsEarned: number;
  distance?: number;
  isLookBackAvailable?: boolean;
  onLookBack?: () => void;
  isPaused: boolean;
  isPortrait?: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showTutorialHint: boolean;
  onPauseToggle: () => void;
  onSoundToggle: () => void;
  onMusicToggle: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  multiplier,
  bestScore,
  coinsEarned,
  distance = 0,
  isLookBackAvailable = false,
  onLookBack,
  isPaused,
  isPortrait = false,
  soundEnabled,
  musicEnabled,
  showTutorialHint,
  onPauseToggle,
  onSoundToggle,
  onMusicToggle,
}) => {
  const lang = i18n.getLanguage();

  return (
    <div
      id="game-hud"
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between select-none p-3 sm:p-4 md:p-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] ${
        isPortrait
          ? 'pb-[max(4.75rem,calc(env(safe-area-inset-bottom,0px)+4rem))]'
          : 'pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]'
      } portrait:pb-[max(4.75rem,calc(env(safe-area-inset-bottom,0px)+4rem))] landscape:pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]`}
    >
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Left: Score & Multiplier */}
        <div className="flex flex-col min-w-0">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-cyan-400/80 uppercase truncate">
            {i18n.t('score')}
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wider font-['Chakra_Petch'] drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] leading-tight">
            {score.toLocaleString()}
          </div>

          {/* Combo Multiplier Badge */}
          {multiplier > 1 && (
            <div
              id="combo-badge"
              className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg w-fit ${
                multiplier >= 5
                  ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-red-500/40 animate-pulse'
                  : multiplier >= 3
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/30'
                  : 'bg-cyan-900/70 border border-cyan-400/40 text-cyan-300'
              }`}
            >
              <span>{i18n.t('combo')}</span>
              <span className="text-xs sm:text-sm font-black">x{multiplier}</span>
            </div>
          )}
        </div>

        {/* Center: Distance & Best Score */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Distance Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/75 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-700/50 text-cyan-300">
            <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wide">
              {Math.floor(distance)}m
            </span>
          </div>

          {/* Best Score */}
          <div className="hidden sm:flex flex-col items-center bg-slate-900/60 backdrop-blur-md px-3 sm:px-4 py-1 rounded-xl border border-slate-700/50">
            <div className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
              {i18n.t('bestScore')}
            </div>
            <div className="text-xs sm:text-sm font-bold text-amber-400 font-['Chakra_Petch']">
              {Math.max(score, bestScore).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right: Coins & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Run coins */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/75 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-amber-500/30 text-amber-400 shadow-sm">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold font-['Chakra_Petch']">+{coinsEarned}</span>
          </div>

          {/* Audio Quick Toggles */}
          <button
            id="btn-quick-sound"
            type="button"
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onSoundToggle();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            )}
          </button>

          <button
            id="btn-quick-music"
            type="button"
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onMusicToggle();
            }}
            className={`p-1.5 sm:p-2 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-700/60 transition-colors cursor-pointer ${
              musicEnabled ? 'text-cyan-400 border-cyan-500/40' : 'text-slate-500'
            }`}
            title={musicEnabled ? 'Stop Music' : 'Start Music'}
          >
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Pause Button */}
          <button
            id="btn-pause"
            type="button"
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onPauseToggle();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pause Game (ESC)"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Area: Look Back Mechanic Button & Tutorial */}
      <div
        className={`flex flex-col items-center gap-2.5 w-full pointer-events-none ${
          isPortrait ? 'mb-2 sm:mb-3' : 'mb-1 sm:mb-1.5'
        } portrait:mb-2 landscape:mb-1`}
      >
        {/* Brief Natural Tutorial Hint */}
        {showTutorialHint && (
          <div className="flex flex-col items-center animate-bounce duration-700 pointer-events-none mb-1">
            <div className="bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-sm md:text-base font-black tracking-wider text-cyan-300 font-['Chakra_Petch'] uppercase">
                {lang === 'id' ? 'KETUK ATAU TEKAN SPASI UNTUK MELOMPAT' : 'TAP OR PRESS SPACE TO JUMP'}
              </span>
            </div>
          </div>
        )}

        {/* Look Back Action Trigger - Ergonomic for Mobile Thumb & Desktop Keys */}
        {onLookBack && (
          <div className="pointer-events-auto flex items-center justify-between w-full max-w-md px-3 sm:px-2 pb-1">
            {/* Dedicated Android/Touch Thumb Button */}
            <button
              id="btn-look-back"
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onLookBack();
              }}
              className={`flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 select-none shadow-2xl cursor-pointer min-h-[52px] sm:min-h-[48px] touch-manipulation ${
                isLookBackAvailable
                  ? 'bg-red-950/95 hover:bg-red-900 border-red-500 text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.6)] animate-pulse ring-2 ring-red-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white shadow-black/60'
              }`}
              title={lang === 'id' ? 'Tengok ke Belakang (Q / B)' : 'Look Behind (Q / B)'}
            >
              {isLookBackAvailable ? (
                <EyeOff className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <Eye className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span className="font-extrabold whitespace-nowrap">{i18n.t('lookBack')}</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-black/50 border border-slate-700 text-slate-300 font-mono">
                B / Q
              </span>
            </button>

            {/* Subtle mobile thumb hint or status */}
            <div className="text-[10px] font-mono text-slate-400/80 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80 hidden xs:block">
              {isLookBackAvailable
                ? (lang === 'id' ? 'ENTITAS DEKAT!' : 'ENTITY CLOSE!')
                : (lang === 'id' ? 'WASPADAI BAYANGAN' : 'WATCH THE SHADOW')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
