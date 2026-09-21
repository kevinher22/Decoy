import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Share2,
  Sparkles,
  Trophy,
  Home,
  Check,
  Flame,
  Coins,
  BookOpen,
  Eye,
  ArrowRight,
  Globe,
  Zap,
} from 'lucide-react';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';
import { GAME_ENDINGS } from '../data/storyData';
import { GameEnding } from '../types';
import { ads } from '../services/ads';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  combo: number;
  coinsEarned: number;
  isNewRecord: boolean;
  distance?: number;
  newEndingId?: string | null;
  newFragments?: string[];
  canRevive?: boolean;
  onRevive?: () => void;
  onPlayAgain: () => void;
  onOpenCustomize: () => void;
  onOpenAchievements: () => void;
  onOpenStoryJournal?: () => void;
  onOpenEndings?: () => void;
  onOpenLeaderboard?: () => void;
  onWatchEndingCutscene?: (ending: GameEnding) => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  combo,
  coinsEarned,
  isNewRecord,
  distance = 0,
  newEndingId,
  newFragments = [],
  canRevive = false,
  onRevive,
  onPlayAgain,
  onOpenCustomize,
  onOpenAchievements,
  onOpenStoryJournal,
  onOpenEndings,
  onOpenLeaderboard,
  onWatchEndingCutscene,
  onBackToMenu,
}) => {
  const [copied, setCopied] = useState(false);
  const [reviveTimer, setReviveTimer] = useState(5);
  const [isReviving, setIsReviving] = useState(false);
  const lang = i18n.getLanguage();
  const adsRemoved = ads.isAdsRemoved();

  // 5-second countdown timer for second chance revive
  useEffect(() => {
    if (!canRevive || !onRevive) return;
    if (reviveTimer <= 0) return;

    const interval = setInterval(() => {
      setReviveTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [canRevive, onRevive, reviveTimer]);

  const handleTriggerRevive = () => {
    if (!onRevive || isReviving) return;
    setIsReviving(true);
    sound.playClick();

    ads.showRewarded('rewarded_second_chance', () => {
      sound.playAchievement();
      onRevive();
    }, () => {
      setIsReviving(false);
    });
  };

  const unlockedEndingData = newEndingId
    ? GAME_ENDINGS.find((e) => e.id === newEndingId)
    : null;

  const handleShare = async () => {
    sound.playClick();
    const shareText =
      lang === 'id'
        ? `⚡ Skor ${score.toLocaleString()} (${distance}m) di DON'T BLINK! Jangan berkedip jika ingin selamat!`
        : `⚡ I scored ${score.toLocaleString()} (${distance}m) in DON'T BLINK! Don't blink if you want to survive!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DON'T BLINK Arcade Record",
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="game-over-modal"
      className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md z-30 select-none animate-fadeIn"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center max-h-[92vh] overflow-y-auto">
        {/* Record Badge or Game Over Header */}
        {isNewRecord ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/50 text-amber-400 text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{i18n.t('newRecord')}</span>
          </div>
        ) : (
          <div className="text-xs font-bold tracking-widest text-red-400/90 uppercase mb-2">
            {i18n.t('runComplete')}
          </div>
        )}

        <h2 className="text-4xl font-black tracking-tight text-white font-['Chakra_Petch'] uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          {i18n.t('gameOver')}
        </h2>

        {/* 5-Second Second Chance Rewarded Revive Choice */}
        {canRevive && onRevive && reviveTimer > 0 && (
          <div className="w-full my-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-sky-950/80 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-black text-xs font-['Chakra_Petch'] uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-cyan-400" />
                <span>{lang === 'id' ? 'KESEMPATAN KEDUA' : 'SECOND CHANCE'}</span>
              </div>
              <span className="text-xs font-mono font-black text-amber-400 px-2 py-0.5 rounded-full bg-slate-950 border border-amber-500/40 animate-pulse">
                {reviveTimer}s
              </span>
            </div>

            <button
              id="btn-revive-second-chance"
              type="button"
              disabled={isReviving}
              onClick={handleTriggerRevive}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider font-['Chakra_Petch'] bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>
                {adsRemoved
                  ? (lang === 'id' ? '⚡ BANGKIT LANGSUNG (TANPA IKLAN)' : '⚡ INSTANT REVIVE (NO ADS)')
                  : (lang === 'id' ? '▶ LIHAT IKLAN UNTUK BANGKIT' : '▶ WATCH AD TO REVIVE')}
              </span>
            </button>
          </div>
        )}

        {/* Ending or Fragment Unlocked Alert */}
        {unlockedEndingData && (
          <div className="w-full my-3 p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2 text-left">
              <Eye className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="font-bold font-mono">
                  {lang === 'id' ? 'AKHIR KISAH TERBUKA!' : 'ENDING UNLOCKED!'}
                </p>
                <p className="text-[11px] text-purple-300">
                  {lang === 'id'
                    ? unlockedEndingData.title.id
                    : unlockedEndingData.title.en}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onWatchEndingCutscene && (
                <button
                  id="btn-play-ending-cinematic-now"
                  onClick={() => onWatchEndingCutscene(unlockedEndingData)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                >
                  {lang === 'id' ? 'KISAH' : 'WATCH'}
                </button>
              )}
              {onOpenEndings && (
                <button
                  id="btn-view-unlocked-ending"
                  onClick={onOpenEndings}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-500/40 text-purple-200 font-mono text-[10px] font-bold uppercase cursor-pointer"
                >
                  {lang === 'id' ? 'ARSIP' : 'ARCHIVE'}
                </button>
              )}
            </div>
          </div>
        )}

        {newFragments && newFragments.length > 0 && !unlockedEndingData && (
          <div className="w-full my-2.5 p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {lang === 'id'
                  ? `+${newFragments.length} Fragmen Memori Baru Ditemukan`
                  : `+${newFragments.length} New Memory Fragment(s) Found`}
              </span>
            </div>
            {onOpenStoryJournal && (
              <button
                id="btn-view-unlocked-fragments"
                onClick={onOpenStoryJournal}
                className="text-[10px] text-cyan-400 font-bold underline cursor-pointer"
              >
                {lang === 'id' ? 'Baca' : 'Read'}
              </button>
            )}
          </div>
        )}

        {/* Score Breakdown Card */}
        <div className="w-full my-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-3">
          {/* Main Run Score */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
              {i18n.t('finalScore')}
            </span>
            <span className="text-4xl font-extrabold text-white font-['Chakra_Petch'] tracking-wide drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            {/* Best Score */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {i18n.t('bestScore')}
              </span>
              <span className="text-base font-extrabold text-amber-400 font-['Chakra_Petch']">
                {bestScore.toLocaleString()}
              </span>
            </div>

            {/* Max Combo */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {i18n.t('maxCombo')}
              </span>
              <span className="text-base font-extrabold text-cyan-300 font-['Chakra_Petch']">
                x{combo}
              </span>
            </div>

            {/* Coins Earned */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {i18n.t('orbs')}
              </span>
              <span className="text-base font-extrabold text-emerald-400 font-['Chakra_Petch'] flex items-center gap-0.5">
                <Coins className="w-3.5 h-3.5 text-amber-400 inline" />
                +{coinsEarned}
              </span>
            </div>
          </div>

          {/* Distance Indicator */}
          {distance > 0 && (
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400 px-2">
              <span>{i18n.t('distance')}:</span>
              <span className="font-bold text-slate-200">{distance}m</span>
            </div>
          )}
        </div>

        {/* Primary 1-Tap Play Again Action */}
        <button
          id="btn-play-again"
          type="button"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-black text-lg tracking-wider font-['Chakra_Petch'] shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>{i18n.t('playAgain')}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-black/25 text-white/90 border border-white/20">
            SPACE
          </span>
        </button>

        {/* Action Row: Leaderboard & Share */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2.5">
          {onOpenLeaderboard && (
            <button
              id="btn-result-leaderboard"
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
              }}
              className="py-2.5 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'id' ? 'PERINGKAT' : 'RANKS'}</span>
            </button>
          )}

          <button
            id="btn-share-score"
            type="button"
            onClick={handleShare}
            className={`py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !onOpenLeaderboard ? 'col-span-2' : ''
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{i18n.t('copiedToClipboard')}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>{i18n.t('shareScore')}</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Navigation Row */}
        <div className="w-full grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            id="btn-result-story"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenStoryJournal?.();
            }}
            className="flex flex-col items-center py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[10px] font-bold">{i18n.t('storyJournal')}</span>
          </button>

          <button
            id="btn-result-endings"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenEndings?.();
            }}
            className="flex flex-col items-center py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-purple-400 mb-0.5" />
            <span className="text-[10px] font-bold">{i18n.t('endings')}</span>
          </button>

          <button
            id="btn-result-customize"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCustomize();
            }}
            className="flex flex-col items-center py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] font-bold">{i18n.t('skins')}</span>
          </button>

          <button
            id="btn-result-menu"
            type="button"
            onClick={() => {
              sound.playClick();
              onBackToMenu();
            }}
            className="flex flex-col items-center py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400 mb-0.5" />
            <span className="text-[10px] font-bold">{i18n.t('menu')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
