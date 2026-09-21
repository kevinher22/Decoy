import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, SkipForward, Volume2, ShieldCheck } from 'lucide-react';
import { GameEnding } from '../types';
import { i18n } from '../services/i18n';
import { sound } from '../services/audio';
import { storage } from '../services/storage';
import { renderEndingScene } from '../game/endingVisuals';

interface EndingCutsceneModalProps {
  ending: GameEnding | null;
  onClose: () => void;
}

interface EndingDialogueLine {
  id: string;
  en: string;
  timeSec: number;
  durationSec?: number;
}

interface EndingSceneConfig {
  artworkUrl: string;
  cameraAnim: {
    scale: [number, number];
    x: [number, number];
    y: [number, number];
    duration: number;
  };
  dialogueSequence: EndingDialogueLine[];
  ambientMood: 'NORMAL' | 'INTENSE' | 'DANGER' | 'HORROR' | 'ENDING';
  accentColor: string;
}

const ENDING_CONFIGS: Record<string, EndingSceneConfig> = {
  ending_01: {
    artworkUrl: '/assets/story/endings/ending-01-the-escape.svg',
    cameraAnim: {
      scale: [1, 1.08],
      x: [0, -20],
      y: [0, -10],
      duration: 10,
    },
    dialogueSequence: [
      {
        id: 'Setelah semua yang terjadi... akhirnya aku berhasil keluar.',
        en: 'After everything that happened... I finally made it out.',
        timeSec: 1.5,
        durationSec: 3.2,
      },
      {
        id: '...kan?',
        en: '...right?',
        timeSec: 6.0,
        durationSec: 2.2,
      },
    ],
    ambientMood: 'NORMAL',
    accentColor: '#38bdf8',
  },
  ending_02: {
    artworkUrl: '/assets/story/endings/ending-02-the-truth.svg',
    cameraAnim: {
      scale: [1.02, 1.12],
      x: [-15, 10],
      y: [5, -10],
      duration: 10,
    },
    dialogueSequence: [
      {
        id: 'Data terminal fasilitas mulai membuka rekam jejak yang terkunci...',
        en: 'The facility terminal begins unlocking forbidden telemetry logs...',
        timeSec: 1.5,
        durationSec: 3.2,
      },
      {
        id: 'Aku akhirnya tahu apa yang selama ini mengejarku.',
        en: 'I finally know what has been chasing me all this time.',
        timeSec: 5.8,
        durationSec: 2.8,
      },
    ],
    ambientMood: 'NORMAL',
    accentColor: '#06b6d4',
  },
  ending_03: {
    artworkUrl: '/assets/story/endings/ending-03-you-blinked.svg',
    cameraAnim: {
      scale: [1.05, 1.2],
      x: [10, -30],
      y: [-5, 15],
      duration: 8,
    },
    dialogueSequence: [
      {
        id: 'Kau mengabaikan aturan mutlak... Kau menoleh ke belakang.',
        en: 'You broke the absolute command... You turned to look back.',
        timeSec: 1.0,
        durationSec: 2.8,
      },
      {
        id: 'Seharusnya aku nggak melihat...',
        en: "I shouldn't have looked back...",
        timeSec: 4.8,
        durationSec: 2.2,
      },
    ],
    ambientMood: 'HORROR',
    accentColor: '#ef4444',
  },
  ending_04: {
    artworkUrl: '/assets/story/endings/ending-04-the-thing.svg',
    cameraAnim: {
      scale: [1.02, 1.1],
      x: [0, 0],
      y: [10, -15],
      duration: 10,
    },
    dialogueSequence: [
      {
        id: 'Aku berhenti takut.',
        en: 'I stopped being afraid.',
        timeSec: 1.5,
        durationSec: 2.5,
      },
      {
        id: 'Dan entah kenapa... dia juga berhenti mengejarku.',
        en: 'And somehow... it stopped chasing me too.',
        timeSec: 5.2,
        durationSec: 3.0,
      },
    ],
    ambientMood: 'DANGER',
    accentColor: '#c084fc',
  },
  ending_05: {
    artworkUrl: '/assets/story/endings/ending-05-the-memory.svg',
    cameraAnim: {
      scale: [1.03, 1.12],
      x: [-10, 15],
      y: [0, -12],
      duration: 10,
    },
    dialogueSequence: [
      {
        id: 'Fragmen kristal masa lalu beresonansi dengan sirkuit sarafmu.',
        en: 'The crystal shards of the past resonate with your neural network.',
        timeSec: 1.5,
        durationSec: 3.2,
      },
      {
        id: 'Sekarang... aku ingat semuanya.',
        en: 'Now... I remember everything.',
        timeSec: 5.8,
        durationSec: 2.8,
      },
    ],
    ambientMood: 'NORMAL',
    accentColor: '#38bdf8',
  },
  ending_06: {
    artworkUrl: '/assets/story/endings/ending-06-false-escape.svg',
    cameraAnim: {
      scale: [1.08, 0.98],
      x: [0, 0],
      y: [-10, 15],
      duration: 11,
    },
    dialogueSequence: [
      {
        id: 'Tempat ini... ini bukan jalan keluar.',
        en: "This place... this isn't an exit.",
        timeSec: 1.5,
        durationSec: 2.8,
      },
      {
        id: 'YOU NEVER ESCAPED. Siklus pelarian tidak pernah berakhir.',
        en: 'YOU NEVER ESCAPED. The endless corridor continues.',
        timeSec: 5.8,
        durationSec: 3.2,
      },
    ],
    ambientMood: 'HORROR',
    accentColor: '#f59e0b',
  },
  ending_07: {
    artworkUrl: '/assets/story/endings/ending-07-dont-blink.svg',
    cameraAnim: {
      scale: [1.0, 1.15],
      x: [0, 0],
      y: [5, -15],
      duration: 12,
    },
    dialogueSequence: [
      {
        id: 'Jadi selama ini...',
        en: 'So all this time...',
        timeSec: 1.5,
        durationSec: 2.6,
      },
      {
        id: 'Aku bukan sedang melarikan diri darinya.',
        en: "I wasn't running away from it.",
        timeSec: 5.8,
        durationSec: 3.2,
      },
    ],
    ambientMood: 'ENDING',
    accentColor: '#f59e0b',
  },
};

export const EndingCutsceneModal: React.FC<EndingCutsceneModalProps> = ({ ending, onClose }) => {
  const lang = i18n.getLanguage();
  const [elapsed, setElapsed] = useState(0);
  const [activeDialogue, setActiveDialogue] = useState<{ id: string; en: string; index: number } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const reqFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerSkin = storage.getData().selectedSkin || 'default';

  const endingId = ending?.id || 'ending_01';
  const config = ENDING_CONFIGS[endingId] || ENDING_CONFIGS.ending_01;
  const isTrueEnding = ending?.id === 'ending_07';

  useEffect(() => {
    if (!ending) return;

    sound.playEndingUnlocked();
    startTimeRef.current = Date.now();
    setElapsed(0);
    setActiveDialogue(null);
    setIsFinished(false);

    // Audio cue sequence
    const timerAudio = setTimeout(() => {
      if (endingId === 'ending_03') {
        sound.playGlitch();
      } else if (endingId === 'ending_01') {
        sound.playBreathing();
      } else {
        sound.playWhisper();
      }
    }, 1800);

    const tick = () => {
      const sec = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(sec);

      // Render dynamic 60fps ending canvas scene
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderEndingScene(ctx, endingId, sec, playerSkin);
      }

      // Determine active dialogue line with precise start and duration window
      let currentActive: { id: string; en: string; index: number } | null = null;
      for (let i = 0; i < config.dialogueSequence.length; i++) {
        const item = config.dialogueSequence[i];
        const dur = item.durationSec ?? 3.0;
        if (sec >= item.timeSec && sec < item.timeSec + dur) {
          currentActive = { id: item.id, en: item.en, index: i };
          break;
        }
      }
      setActiveDialogue(currentActive);

      if (sec >= config.cameraAnim.duration) {
        setIsFinished(true);
      }

      reqFrameRef.current = requestAnimationFrame(tick);
    };

    reqFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(timerAudio);
      if (reqFrameRef.current !== null) {
        cancelAnimationFrame(reqFrameRef.current);
      }
    };
  }, [ending, endingId, config, playerSkin]);

  if (!ending) return null;

  return (
    <div
      id="modal-ending-cutscene"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none overflow-hidden"
    >
      {/* Cinematic Viewport Container (16:9 responsive frame with letterboxing) */}
      <div className="relative w-full max-w-5xl aspect-[16/9] max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] bg-black">
        {/* Animated Artwork Canvas Layer */}
        <motion.div
          animate={{
            scale: config.cameraAnim.scale,
            x: config.cameraAnim.x,
            y: config.cameraAnim.y,
          }}
          transition={{
            duration: config.cameraAnim.duration,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 w-full h-full"
        >
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-cover select-none"
          />
          <img
            src={config.artworkUrl}
            alt={ending.title.en}
            className="absolute inset-0 w-full h-full object-cover select-none opacity-20 mix-blend-screen pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Dynamic Atmospheric Lighting & FX Overlays */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${config.accentColor}22 0%, transparent 70%)`,
          }}
        />

        {/* Ambient Fog / Vignette Layer */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-black/20 to-black/60" />

        {/* Top Cinematic Header (Ending Badge & Skip Button) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-black/70 border border-slate-700 text-slate-200 uppercase backdrop-blur-md">
              ENDING #{ending.number}
            </span>
            {isTrueEnding && (
              <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase backdrop-blur-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> TRUE ENDING
              </span>
            )}
          </div>

          <button
            id="btn-skip-ending-cutscene"
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all backdrop-blur-md cursor-pointer"
          >
            <span>{lang === 'id' ? 'LEWATI' : 'SKIP'}</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ending Title Overlay at Top */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-11 sm:top-14 left-0 right-0 text-center z-10 pointer-events-none px-3 sm:px-6"
        >
          <h2
            className={`text-base sm:text-2xl md:text-3xl font-black font-['Chakra_Petch'] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(0,0,0,0.85)] ${
              isTrueEnding ? 'text-amber-300' : 'text-slate-100'
            }`}
          >
            {lang === 'id' ? ending.title.id : ending.title.en}
          </h2>
          <p className="text-[10px] sm:text-sm font-mono text-cyan-300 tracking-wider drop-shadow-md">
            {lang === 'id' ? ending.subtitle.id : ending.subtitle.en}
          </p>
        </motion.div>

        {/* Subtle, Non-Intrusive Cinematic Subtitles */}
        <div
          className={`absolute left-3 sm:left-6 right-3 sm:right-6 z-20 flex flex-col items-center pointer-events-none transition-all duration-300 ${
            isFinished ? 'bottom-16 sm:bottom-20' : 'bottom-4 sm:bottom-7'
          }`}
        >
          <AnimatePresence mode="wait">
            {activeDialogue && (
              <motion.div
                key={`dialogue-${activeDialogue.index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="max-w-[92%] sm:max-w-xl bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-2xl text-center pointer-events-auto"
              >
                <p className="text-slate-100 font-sans text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line italic font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  "{lang === 'id' ? activeDialogue.id : activeDialogue.en}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button: Appears cleanly after dialogue and visual finish with zero overlap */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-auto"
            >
              <button
                id="btn-continue-after-ending"
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-mono font-bold tracking-wider text-xs sm:text-sm transition-all shadow-xl cursor-pointer ${
                  isTrueEnding
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/30 animate-pulse'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 animate-pulse'
                }`}
              >
                <span>{lang === 'id' ? 'LANJUTKAN' : 'CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic 2.39:1 Letterbox Bars */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black z-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black z-30 pointer-events-none" />
      </div>
    </div>
  );
};
