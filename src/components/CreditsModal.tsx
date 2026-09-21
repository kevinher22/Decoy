import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { i18n } from '../services/i18n';
import { sound } from '../services/audio';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const lang = i18n.getLanguage();

  if (!isOpen) return null;

  return (
    <div
      id="modal-credits"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl bg-slate-950/90 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col relative overflow-hidden"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 z-10">
          <button
            id="btn-credits-back"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{i18n.t('back')}</span>
          </button>

          <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
            DON'T BLINK // ARCHIVE
          </span>
        </div>

        {/* Cinematic Credits Roll Container */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col items-center text-center overflow-y-auto max-h-[70vh] z-10 space-y-8">
          {/* Main Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3" /> OFFICIAL CREDITS
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-['Chakra_Petch'] tracking-widest text-white uppercase drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              DON'T{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                BLINK
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400 tracking-wider">
              {lang === 'id' ? 'Pelarian Misteri & Koridor Siber' : 'Arcade Mystery Survival'}
            </p>
          </div>

          {/* Primary Creator Credit */}
          <div className="py-4 border-y border-slate-800/60 w-full max-w-sm space-y-2">
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
              {i18n.t('createdBy')}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-['Chakra_Petch'] text-cyan-300 tracking-wider">
              KEHERCER
            </div>
            <p className="text-xs font-mono text-slate-400">
              {lang === 'id' ? 'Desain Game & Konsep Asli' : 'Game Concept & Original Design'}
            </p>
          </div>

          {/* Technical & Production Architecture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                {lang === 'id' ? 'SISTEM AUDIO' : 'AUDIO SYSTEM'}
              </span>
              <p className="text-xs font-bold text-slate-200">Dynamic Procedural Audio</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Web Audio API Synthesis</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                {lang === 'id' ? 'VISUAL & ENGINE' : 'ENGINE & RENDERER'}
              </span>
              <p className="text-xs font-bold text-slate-200">60 FPS Custom Canvas</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Hardware Accelerated 2D</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                {lang === 'id' ? 'PLATFORM DUKUNGAN' : 'CROSS-PLATFORM'}
              </span>
              <p className="text-xs font-bold text-slate-200">Android & Desktop Web</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Touch & Keyboard Controls</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                {lang === 'id' ? 'KARYA SENI' : 'ORIGINAL ARTWORK'}
              </span>
              <p className="text-xs font-bold text-slate-200">7 Unique Ending Cinematics</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Atmospheric Vector & Canvas</p>
            </div>
          </div>

          {/* Dedication / Special Thanks */}
          <div className="pt-2 text-center space-y-1">
            <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
              <span>{lang === 'id' ? 'Dibuat dengan dedikasi untuk seluruh pemain' : 'Dedicated to all players & survivors'}</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              {lang === 'id' ? 'Ingat: Jangan pernah berkedip.' : 'Remember: Never blink.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400 font-mono z-10">
          <span>&copy; {new Date().getFullYear()} KEHERCER</span>
          <button
            id="btn-credits-close"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider uppercase transition-colors cursor-pointer"
          >
            {i18n.t('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
