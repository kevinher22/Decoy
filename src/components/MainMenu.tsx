import React from 'react';
import {
  Play,
  Sparkles,
  Calendar,
  Trophy,
  Settings,
  BarChart2,
  Coins,
  BookOpen,
  Eye,
  Globe,
} from 'lucide-react';
import { sound } from '../services/audio';
import { i18n } from '../services/i18n';
import { storage } from '../services/storage';

interface MainMenuProps {
  bestScore: number;
  totalCoins: number;
  onPlay: () => void;
  onOpenCustomize: () => void;
  onOpenDaily: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenLeaderboard: () => void;
  onOpenStoryJournal: () => void;
  onOpenEndings: () => void;
  hasDailyRewardReady: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  bestScore,
  totalCoins,
  onPlay,
  onOpenCustomize,
  onOpenDaily,
  onOpenAchievements,
  onOpenSettings,
  onOpenCredits,
  onOpenLeaderboard,
  onOpenStoryJournal,
  onOpenEndings,
  hasDailyRewardReady,
}) => {
  const lang = i18n.getLanguage();
  const storyState = storage.getStoryState();
  const unlockedEndingsCount = storyState.unlockedEndings.length;

  const toggleLanguage = () => {
    sound.playClick();
    const next = lang === 'id' ? 'en' : 'id';
    i18n.setLanguage(next);
    storage.updateSettings({ language: next });
  };

  return (
    <div
      id="main-menu"
      className="absolute inset-0 flex flex-col justify-between items-center p-3 sm:p-6 select-none bg-gradient-to-b from-[#090b14]/75 via-[#0b0e1a]/60 to-[#090b14]/85 backdrop-blur-[2px] z-10 overflow-y-auto max-h-full pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      {/* Top Bar: Currency, Language & Settings */}
      <div className="w-full max-w-lg flex justify-between items-center">
        {/* Total Banked Coins */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/30 shadow-lg">
          <Coins className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <span className="text-base font-extrabold text-amber-300 font-['Chakra_Petch']">
            {totalCoins.toLocaleString()}
          </span>
        </div>

        {/* Right Controls: Language & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            id="btn-quick-lang"
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs font-mono font-bold cursor-pointer"
            title="Switch Language (ID / EN)"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {/* Settings button */}
          <button
            id="btn-menu-settings"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            title={i18n.t('settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Title & Best Score */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="inline-block mb-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold tracking-widest uppercase">
          {lang === 'id' ? 'PELARIAN MISTERI KORIDOR' : 'ARCADE MYSTERY SURVIVAL'}
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-['Chakra_Petch'] drop-shadow-[0_0_25px_rgba(6,182,212,0.45)] uppercase">
          DON'T{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            BLINK
          </span>
        </h1>

        <p className="mt-1 text-sm sm:text-base font-medium tracking-wide text-slate-400">
          {i18n.t('tagline')}
        </p>

        {/* High Score Badge */}
        <div className="mt-6 inline-flex flex-col items-center px-6 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {i18n.t('bestScore')}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-['Chakra_Petch'] tracking-wide">
            {bestScore > 0 ? bestScore.toLocaleString() : '0'}
          </span>
        </div>

        {/* Primary Play Button */}
        <button
          id="btn-menu-play"
          type="button"
          onClick={() => {
            sound.playClick();
            onPlay();
          }}
          className="group relative mt-7 px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white font-black text-xl tracking-wider uppercase font-['Chakra_Petch'] shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
          <span>{i18n.t('playNow')}</span>
          <span className="hidden sm:inline-block ml-1 px-2 py-0.5 text-xs bg-black/20 rounded-md border border-white/20 text-white/80">
            SPACE
          </span>
        </button>
      </div>

      {/* Feature Navigation Bar */}
      <div className="w-full max-w-lg flex flex-col gap-2">
        {/* Row 1: Mystery & Narrative Hub */}
        <div className="grid grid-cols-2 gap-2">
          {/* Story Journal */}
          <button
            id="btn-menu-story"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenStoryJournal();
            }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono font-bold">{i18n.t('storyJournal')}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300">
              {storyState.unlockedFragments.length}/20
            </span>
          </button>

          {/* Endings Archive */}
          <button
            id="btn-menu-endings"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenEndings();
            }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono font-bold">{i18n.t('endings')}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300">
              {unlockedEndingsCount}/7
            </span>
          </button>
        </div>

        {/* Row 2: Secondary Arcade Action Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Customize Skins */}
          <button
            id="btn-menu-customize"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCustomize();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">{i18n.t('skins')}</span>
          </button>

          {/* Daily Challenge */}
          <button
            id="btn-menu-daily"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenDaily();
            }}
            className="relative flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer"
          >
            {hasDailyRewardReady && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            <Calendar className="w-4 h-4 text-amber-400 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">{i18n.t('daily')}</span>
          </button>

          {/* Achievements */}
          <button
            id="btn-menu-achievements"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-purple-400 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">{i18n.t('badges')}</span>
          </button>

          {/* Leaderboard / Records */}
          <button
            id="btn-menu-leaderboard"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-emerald-400 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">{i18n.t('records')}</span>
          </button>
        </div>

        {/* Row 3: Dedicated Credits Section */}
        <div className="flex justify-center pt-0.5">
          <button
            id="btn-menu-credits"
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCredits();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all text-xs font-mono tracking-widest uppercase cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{i18n.t('credits')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
