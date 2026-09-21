import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, SkipForward, ArrowRight } from 'lucide-react';
import { i18n } from '../services/i18n';
import { sound } from '../services/audio';
import { storage } from '../services/storage';
import { renderFinalStoryScene } from '../game/finalCutsceneVisuals';

interface FinalStoryCutsceneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CutsceneShot {
  id: number;
  durationMs: number;
  image?: string;
  dialogueId?: string;
  dialogueEn?: string;
  dialogueDelayMs?: number;
  dialogueDurationMs?: number;
  titleId?: string;
  titleEn?: string;
  subtitleId?: string;
  subtitleEn?: string;
}

const SHOTS: CutsceneShot[] = [
  // SHOT 1: Fast fragments of all 7 endings flashing
  {
    id: 1,
    durationMs: 3800,
    titleId: 'KONVERGENSI TUJUH KISAH',
    titleEn: 'THE SEVEN ENDINGS CONVERGE',
    subtitleId: 'Seluruh kenangan, ketakutan, dan pelarian...',
    subtitleEn: 'Every memory, every terror, every escape...',
    image: '/assets/story/endings/ending-01-the-escape.svg',
  },
  // SHOT 2: Player standing in the original location from the opening. Total silence.
  {
    id: 2,
    durationMs: 3600,
    image: '/assets/story/endings/ending-05-the-memory.svg',
    dialogueId: 'Koridor awal. Semua suara langkah kaki dan alarm telah lenyap...',
    dialogueEn: 'The initial corridor. All footsteps and alarms have vanished into complete silence...',
    dialogueDelayMs: 600,
    dialogueDurationMs: 2500,
  },
  // SHOT 3: Mysterious entity appears. It does not chase. It simply stands there peacefully.
  {
    id: 3,
    durationMs: 3600,
    image: '/assets/story/endings/ending-02-the-truth.svg',
    dialogueId: 'Entitas itu hadir di hadapanmu. Namun kali ini... ia tidak mengejar.',
    dialogueEn: 'The entity stands before you. But this time... it does not chase.',
    dialogueDelayMs: 600,
    dialogueDurationMs: 2500,
  },
  // SHOT 4: Player slowly turns toward it. No running. No fear.
  {
    id: 4,
    durationMs: 3500,
    image: '/assets/story/endings/ending-04-the-thing.svg',
    dialogueId: 'Kau menatap langsung ke arahnya. Tidak ada lagi rasa takut. Tidak ada alasan untuk lari.',
    dialogueEn: 'You gaze directly into it. No longer afraid. No reason left to run.',
    dialogueDelayMs: 600,
    dialogueDurationMs: 2400,
  },
  // SHOT 5: Camera moves closer to player and entity. Visual clues from story fragments.
  {
    id: 5,
    durationMs: 3800,
    image: '/assets/story/endings/ending-07-dont-blink.svg',
    dialogueId: 'Semua fragmen menyatu. Entitas ini bukanlah pemburu—melainkan cerminan kesadaranmu sendiri yang menjaga jiwamu tetap bernyawa.',
    dialogueEn: 'The fragments align. The entity was never a hunter—it was your own fractured consciousness keeping you alive.',
    dialogueDelayMs: 500,
    dialogueDurationMs: 2800,
  },
  // SHOT 6: The Memorable Reveal Dialogue
  {
    id: 6,
    durationMs: 4200,
    image: '/assets/story/final/final-cutscene.svg',
    dialogueId: '"Jadi akhirnya... kita sampai di sini.\n\nTetapi kau masih belum tahu alasannya."',
    dialogueEn: '"So finally... we have reached this place.\n\nBut you still don\'t know why."',
    dialogueDelayMs: 600,
    dialogueDurationMs: 3100,
  },
  // SHOT 7: Fade to light/darkness. DON'T BLINK // THE STORY CONTINUES...
  {
    id: 7,
    durationMs: 5000,
    image: '/assets/story/final/final-cutscene.svg',
    titleId: "DON'T BLINK",
    titleEn: "DON'T BLINK",
    subtitleId: 'KISAH AKAN BERLANJUT...',
    subtitleEn: 'THE STORY CONTINUES...',
  },
];

export const FinalStoryCutsceneModal: React.FC<FinalStoryCutsceneModalProps> = ({
  isOpen,
  onClose,
}) => {
  const lang = i18n.getLanguage();
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [shot1ImageIndex, setShot1ImageIndex] = useState(0);
  const [isDialogueVisible, setIsDialogueVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shotStartTimeRef = useRef<number>(Date.now());
  const playerSkin = storage.getData().selectedSkin || 'default';

  const shot1Images = [
    '/assets/story/endings/ending-01-the-escape.svg',
    '/assets/story/endings/ending-02-the-truth.svg',
    '/assets/story/endings/ending-03-you-blinked.svg',
    '/assets/story/endings/ending-04-the-thing.svg',
    '/assets/story/endings/ending-05-the-memory.svg',
    '/assets/story/endings/ending-06-false-escape.svg',
    '/assets/story/endings/ending-07-dont-blink.svg',
  ];

  // Advance Shot 1 montage rapidly
  useEffect(() => {
    if (!isOpen || currentShotIndex !== 0) return;

    const interval = setInterval(() => {
      setShot1ImageIndex((prev) => (prev + 1) % shot1Images.length);
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, currentShotIndex]);

  // Main Shot Sequencer
  useEffect(() => {
    if (!isOpen) return;

    shotStartTimeRef.current = Date.now();

    // Trigger starting audio
    sound.setMusicMood('ENDING');
    sound.playEndingUnlocked();

    const shot = SHOTS[currentShotIndex];
    if (!shot) return;

    const timer = setTimeout(() => {
      if (currentShotIndex < SHOTS.length - 1) {
        setCurrentShotIndex((prev) => prev + 1);
        if (currentShotIndex === 2) {
          sound.playWhisper();
        } else if (currentShotIndex === 5) {
          sound.playHeartbeat();
        }
      }
    }, shot.durationMs);

    return () => clearTimeout(timer);
  }, [isOpen, currentShotIndex]);

  // Dynamic 60fps Canvas Loop for Shots 2 through 7
  useEffect(() => {
    if (!isOpen) return;
    let animFrame: number;
    const renderTick = () => {
      const sec = (Date.now() - shotStartTimeRef.current) / 1000;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && currentShotIndex > 0) {
        renderFinalStoryScene(ctx, currentShotIndex, sec, playerSkin);
      }
      animFrame = requestAnimationFrame(renderTick);
    };
    animFrame = requestAnimationFrame(renderTick);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, currentShotIndex, playerSkin]);

  if (!isOpen) return null;

  const currentShot = SHOTS[currentShotIndex];
  const isLastShot = currentShotIndex === SHOTS.length - 1;

  const handleFinish = () => {
    storage.markFinalStoryCutsceneSeen();
    sound.playClick();
    onClose();
  };

  const activeImage =
    currentShotIndex === 0 ? shot1Images[shot1ImageIndex] : currentShot.image;

  return (
    <div
      id="modal-final-story-cutscene"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none overflow-hidden"
    >
      {/* 16:9 Cinema Container */}
      <div className="relative w-full max-w-5xl aspect-[16/9] max-h-[85vh] overflow-hidden rounded-2xl border border-amber-500/40 shadow-[0_0_100px_rgba(245,158,11,0.2)] bg-black">
        {/* Animated Background Canvas Layer */}
        {currentShotIndex > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-full object-cover select-none"
            />
            {activeImage && (
              <img
                src={activeImage}
                alt="Final Story Scene"
                className="absolute inset-0 w-full h-full object-cover select-none opacity-20 mix-blend-screen pointer-events-none"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentShotIndex}-${activeImage}`}
              initial={{ opacity: 0.4, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full"
            >
              {activeImage && (
                <img
                  src={activeImage}
                  alt="Final Story Scene"
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Ambient Glow Atmosphere */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-black/30 to-black/70" />
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-amber-500/10 via-transparent to-transparent" />

        {/* Top Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> FINAL STORY CUTSCENE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-slate-800 text-slate-300">
              SHOT {currentShotIndex + 1} / {SHOTS.length}
            </span>
          </div>

          <button
            id="btn-skip-final-cutscene"
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all backdrop-blur-md cursor-pointer"
          >
            <span>{lang === 'id' ? 'LEWATI' : 'SKIP'}</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center / Hero Overlay on Shot 1 and Shot 7 */}
        {(currentShot.titleId || currentShot.titleEn) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none p-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2 bg-black/70 backdrop-blur-md p-6 rounded-3xl border border-amber-500/30 max-w-xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Chakra_Petch'] tracking-widest text-white uppercase drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                {lang === 'id' ? currentShot.titleId : currentShot.titleEn}
              </h1>
              <p className="text-sm sm:text-base font-mono text-amber-300 tracking-wider">
                {lang === 'id' ? currentShot.subtitleId : currentShot.subtitleEn}
              </p>
            </motion.div>
          </div>
        )}

        {/* Subtitle / Dialogue box at bottom */}
        {(currentShot.dialogueId || currentShot.dialogueEn) && (
          <div
            className={`absolute left-4 sm:left-6 right-4 sm:right-6 z-20 flex flex-col items-center pointer-events-auto transition-all duration-300 ${
              isLastShot ? 'bottom-20 sm:bottom-24' : 'bottom-6'
            }`}
          >
            <motion.div
              key={currentShotIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl bg-black/85 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-center space-y-2"
            >
              <p className="text-slate-100 font-sans text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line italic font-medium">
                {lang === 'id' ? currentShot.dialogueId : currentShot.dialogueEn}
              </p>
            </motion.div>
          </div>
        )}

        {/* Final Continue Button on the last shot */}
        {isLastShot && (
          <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 flex justify-center z-30 pointer-events-auto">
            <button
              id="btn-finish-final-cutscene"
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono tracking-wider text-sm shadow-xl shadow-amber-500/30 transition-all cursor-pointer animate-pulse"
            >
              <span>{lang === 'id' ? 'SELESAIKAN KISAH' : 'COMPLETE THE ODYSSEY'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cinematic Letterbox Bars */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black z-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black z-30 pointer-events-none" />
      </div>
    </div>
  );
};
