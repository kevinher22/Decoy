import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  EyeOff,
  Shield,
  RotateCcw,
  Keyboard,
  Globe,
  Sliders,
  PlaySquare,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { UserSettings } from '../types';
import { sound } from '../services/audio';
import { purchases } from '../services/purchase';
import { i18n } from '../services/i18n';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  onResetData: () => void;
  onClose: () => void;
  onPlayCutscene?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
  onPlayCutscene,
}) => {
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const currentLang = i18n.getLanguage();

  const handleSupportPurchase = async () => {
    sound.playClick();
    const res = await purchases.purchase('remove_ads');
    setPurchaseStatus(res.message);
    setTimeout(() => setPurchaseStatus(null), 4000);
  };

  const handleLanguageChange = (lang: 'id' | 'en') => {
    sound.playClick();
    i18n.setLanguage(lang);
    onUpdateSettings({ language: lang });
  };

  return (
    <div
      id="settings-modal"
      className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md z-30 select-none"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black text-white uppercase font-['Chakra_Petch'] tracking-wider">
            {i18n.t('settings')}
          </h2>

          <button
            id="btn-close-settings"
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

        <div className="overflow-y-auto pr-1 my-3 space-y-4 max-h-[70vh]">
          {/* Language Selection */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              {i18n.t('language')} / LANGUAGE
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-lang-id"
                type="button"
                onClick={() => handleLanguageChange('id')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentLang === 'id'
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🇮🇩</span> Bahasa Indonesia
              </button>

              <button
                id="btn-lang-en"
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentLang === 'en'
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧</span> English
              </button>
            </div>
          </div>

          {/* Audio Preferences & Sliders */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              {i18n.t('audioPreferences')}
            </span>

            {/* Sound FX Toggle & Volume */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-white">{i18n.t('soundFX')}</div>
                    <div className="text-[11px] text-slate-400">{i18n.t('soundFXDesc')}</div>
                  </div>
                </div>

                <button
                  id="toggle-sound-fx"
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                  }}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.soundEnabled && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-400 w-16">
                    SFX: {settings.sfxVolume ?? 80}%
                  </span>
                  <input
                    id="slider-sfx-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume ?? 80}
                    onChange={(e) => onUpdateSettings({ sfxVolume: Number(e.target.value) })}
                    className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Music Toggle & Volume */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Music
                    className={`w-5 h-5 ${settings.musicEnabled ? 'text-cyan-400' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{i18n.t('music')}</div>
                    <div className="text-[11px] text-slate-400">{i18n.t('musicDesc')}</div>
                  </div>
                </div>

                <button
                  id="toggle-music"
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    const nextVal = !settings.musicEnabled;
                    onUpdateSettings({ musicEnabled: nextVal });
                    sound.toggleMusic(nextVal);
                  }}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    settings.musicEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.musicEnabled && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-400 w-16">
                    BGM: {settings.musicVolume ?? 70}%
                  </span>
                  <input
                    id="slider-music-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume ?? 70}
                    onChange={(e) => onUpdateSettings({ musicVolume: Number(e.target.value) })}
                    className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Accessibility & Visual FX */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {i18n.t('accessibility')} & FX
            </span>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-bold text-white">{i18n.t('reducedMotion')}</div>
                  <div className="text-[11px] text-slate-400">{i18n.t('reducedMotionDesc')}</div>
                </div>
              </div>

              <button
                id="toggle-reduced-motion"
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ reducedMotion: !settings.reducedMotion });
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.reducedMotion ? 'bg-purple-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Screen Shake */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-sm font-bold text-white">{i18n.t('screenShake')}</div>
                  <div className="text-[11px] text-slate-400">
                    {currentLang === 'id' ? 'Getaran layar saat near-miss & tabrakan' : 'Camera rumble on near-miss & impact'}
                  </div>
                </div>
              </div>

              <button
                id="toggle-screen-shake"
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ screenShake: !settings.screenShake });
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.screenShake ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.screenShake ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white">{i18n.t('vibration')}</div>
                  <div className="text-[11px] text-slate-400">
                    {currentLang === 'id' ? 'Haptic feedback di perangkat pendukung' : 'Haptic vibration feedback'}
                  </div>
                </div>
              </div>

              <button
                id="toggle-vibration"
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdateSettings({ vibration: !settings.vibration });
                }}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.vibration ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.vibration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Replay Opening Cutscene */}
          {onPlayCutscene && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlaySquare className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm font-bold text-white">
                    {currentLang === 'id' ? 'Cutscene Pembuka' : 'Opening Cutscene'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentLang === 'id' ? 'Tonton kembali sinematik prolog' : 'Replay prologue cinematic'}
                  </div>
                </div>
              </div>

              <button
                id="btn-replay-opening-cutscene"
                type="button"
                onClick={() => {
                  sound.playClick();
                  onPlayCutscene();
                }}
                className="py-1.5 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {currentLang === 'id' ? 'PUTAR' : 'REPLAY'}
              </button>
            </div>
          )}

          {/* Controls Quick Reference */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Keyboard className="w-4 h-4" />
              <span>{i18n.t('howToPlay')}</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5 mt-1 leading-relaxed">
              <div className="flex justify-between">
                <span className="text-slate-400">{i18n.t('controlsJump')}:</span>
                <span className="font-bold text-cyan-300">TAP / CLICK / SPACE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{i18n.t('controlsLookBack')}:</span>
                <span className="font-bold text-rose-400">B / Q / HUD BUTTON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{i18n.t('controlsPause')}:</span>
                <span className="font-bold text-cyan-300">ESC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{i18n.t('controlsRestart')}:</span>
                <span className="font-bold text-cyan-300">SPACE or R</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                {currentLang === 'id'
                  ? 'Catatan: Menoleh ke belakang dapat mengungkap rahasia gelap atau mempercepat bahaya.'
                  : 'Note: Looking back may unveil hidden anomalies or hasten your doom.'}
              </div>
            </div>
          </div>

          {/* Supporter / Remove Ads */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black text-amber-300 font-['Chakra_Petch']">
                  {i18n.t('removeAds')}
                </span>
              </div>
              <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                $1.99
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentLang === 'id'
                ? 'Lencana pendukung dan tanpa iklan saat monetisasi aktif.'
                : 'Supporter status and zero ad interruptions.'}
            </p>

            <button
              id="btn-remove-ads"
              type="button"
              onClick={handleSupportPurchase}
              className="mt-1 py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              UPGRADE STATUS
            </button>

            {purchaseStatus && (
              <div className="text-[11px] text-cyan-300 bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/30">
                {purchaseStatus}
              </div>
            )}
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            {showConfirmReset ? (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 flex flex-col items-center text-center gap-2">
                <span className="text-xs text-red-300 font-bold">
                  {currentLang === 'id'
                    ? 'Hapus skor tinggi, koin, dan progres cerita secara permanen?'
                    : 'Reset high score, coins, and story progress permanently?'}
                </span>
                <div className="flex gap-2 w-full">
                  <button
                    id="btn-confirm-reset-data"
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowConfirmReset(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {currentLang === 'id' ? 'YA, HAPUS SEMUA' : 'YES, RESET ALL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    {currentLang === 'id' ? 'BATAL' : 'CANCEL'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-reset-data"
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 text-xs font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{i18n.t('resetProgress')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
