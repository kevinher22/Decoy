import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SkipForward } from 'lucide-react';
import { i18n } from '../services/i18n';
import { sound } from '../services/audio';
import { storage } from '../services/storage';
import { renderConsistentEntity } from '../game/entityVisuals';

interface OpeningCutsceneProps {
  onComplete: () => void;
}

interface ShotInfo {
  id: number;
  durationMs: number;
  playerState: 'STAND' | 'LOOK_AROUND' | 'JOG' | 'RUN' | 'SPRINT_LOOK_BACK';
  entityState: 'NONE' | 'FAR_GLIMPSE' | 'APPROACH' | 'CHASE_START' | 'CHASE_ACTIVE' | 'CHASE_CLOSE' | 'OVERTAKE';
  cameraZoom: number;
  cameraShake: number;
  dialogueId?: string;
  dialogueEn?: string;
  titleId?: string;
  titleEn?: string;
}

const SHOTS: ShotInfo[] = [
  // SHOT 1: The player is alone in the environment. Subtle breathing. Camera slowly moves.
  {
    id: 1,
    durationMs: 2500,
    playerState: 'STAND',
    entityState: 'NONE',
    cameraZoom: 1.0,
    cameraShake: 0,
    dialogueId: '02:17 AM. Koridor bawah tanah sektor 7...',
    dialogueEn: '02:17 AM. Underground sector 7 corridor...',
  },
  // SHOT 2: A strange sound comes from behind. The player reacts. Dialogue: "Harusnya aku nggak datang ke sini."
  {
    id: 2,
    durationMs: 2400,
    playerState: 'LOOK_AROUND',
    entityState: 'NONE',
    cameraZoom: 1.06,
    cameraShake: 1,
    dialogueId: '"Harusnya aku nggak datang ke sini."',
    dialogueEn: '"I shouldn\'t have come here."',
  },
  // SHOT 3: A distant shadow appears behind the player. It disappears briefly.
  {
    id: 3,
    durationMs: 2200,
    playerState: 'STAND',
    entityState: 'FAR_GLIMPSE',
    cameraZoom: 1.09,
    cameraShake: 1.5,
    dialogueId: '*desau dingin dan statik berdesis dari kegelapan belakang*',
    dialogueEn: '*cold static hiss echoes from the darkness behind*',
  },
  // SHOT 4: The player continues forward. Another sound. The entity appears again, now closer. Dialogue: "Apa itu...?"
  {
    id: 4,
    durationMs: 2400,
    playerState: 'JOG',
    entityState: 'APPROACH',
    cameraZoom: 1.12,
    cameraShake: 2,
    dialogueId: '"Apa itu...?"',
    dialogueEn: '"What is that...?"',
  },
  // SHOT 5: The player realizes something is following them. The player starts running.
  {
    id: 5,
    durationMs: 2300,
    playerState: 'RUN',
    entityState: 'CHASE_START',
    cameraZoom: 1.15,
    cameraShake: 3.5,
    dialogueId: 'Sesuatu sedang mengejarku...!',
    dialogueEn: 'Something is following me...!',
  },
  // SHOT 6: THE ENTITY CHASES THE PLAYER. The entity must ACTUALLY MOVE.
  // Animate: player running, entity running/following, camera tracking, footsteps, breathing, heartbeat, fog, lighting, subtle camera shake.
  {
    id: 6,
    durationMs: 3600,
    playerState: 'RUN',
    entityState: 'CHASE_ACTIVE',
    cameraZoom: 1.2,
    cameraShake: 5.5,
    dialogueId: 'Lari! Jangan biarkan ia menyusul!',
    dialogueEn: 'Run! Do not let it catch up!',
  },
  // SHOT 7: The player almost turns around. Dialogue: "Jangan lihat ke belakang." Then: "Jangan..."
  {
    id: 7,
    durationMs: 2500,
    playerState: 'SPRINT_LOOK_BACK',
    entityState: 'CHASE_CLOSE',
    cameraZoom: 1.25,
    cameraShake: 7.5,
    dialogueId: '"Jangan lihat ke belakang. Jangan..."',
    dialogueEn: '"Don\'t look back. Don\'t..."',
  },
  // SHOT 8: The entity suddenly gets closer. Create a brief intense moment. Then: DON'T BLINK -> Transition into normal gameplay.
  {
    id: 8,
    durationMs: 2500,
    playerState: 'RUN',
    entityState: 'OVERTAKE',
    cameraZoom: 1.32,
    cameraShake: 12,
    titleId: "DON'T BLINK",
    titleEn: "DON'T BLINK",
    dialogueId: 'BERKEDIP = MATI.',
    dialogueEn: 'TO BLINK IS TO CEASE.',
  },
];

export const OpeningCutscene: React.FC<OpeningCutsceneProps> = ({ onComplete }) => {
  const [shotIndex, setShotIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lang = i18n.getLanguage();

  // Animation values for smooth interpolation
  const animRef = useRef({
    playerX: 350,
    entityX: -200,
    targetEntityX: -200,
    entityAlpha: 0,
    fogOffset: 0,
    gridOffset: 0,
    runFrame: 0,
    breathOffset: 0,
    shakeX: 0,
    shakeY: 0,
  });

  // Music & Tension Setup
  useEffect(() => {
    sound.startMusic();
    sound.setMusicMood('DANGER');
    sound.playHeartbeat();

    return () => {
      sound.setMusicMood('NORMAL');
    };
  }, []);

  // Shot Sequencer & Audio Triggers
  useEffect(() => {
    const currentShot = SHOTS[shotIndex];

    // Sound cues per shot (exact 8-shot sequence)
    if (shotIndex === 0) {
      sound.playBreathing();
    } else if (shotIndex === 1) {
      sound.playWhisper();
    } else if (shotIndex === 2) {
      sound.playGlitch();
    } else if (shotIndex === 3) {
      sound.playWhisper();
    } else if (shotIndex === 4) {
      sound.playHeartbeat();
    } else if (shotIndex === 5) {
      sound.setMusicMood('HORROR');
      sound.playHeartbeat();
    } else if (shotIndex === 6) {
      sound.playWhisper();
    } else if (shotIndex === 7) {
      sound.playNearMiss();
      sound.playGlitch();
    }

    // Set smooth target positions based on entity state
    if (currentShot.entityState === 'NONE') {
      animRef.current.targetEntityX = -350;
      animRef.current.entityAlpha = 0;
    } else if (currentShot.entityState === 'FAR_GLIMPSE') {
      animRef.current.targetEntityX = -80;
      animRef.current.entityAlpha = 0.5;
    } else if (currentShot.entityState === 'APPROACH') {
      animRef.current.targetEntityX = 50;
      animRef.current.entityAlpha = 0.75;
    } else if (currentShot.entityState === 'CHASE_START') {
      animRef.current.targetEntityX = 130;
      animRef.current.entityAlpha = 0.85;
    } else if (currentShot.entityState === 'CHASE_ACTIVE') {
      animRef.current.targetEntityX = 200;
      animRef.current.entityAlpha = 0.95;
    } else if (currentShot.entityState === 'CHASE_CLOSE') {
      animRef.current.targetEntityX = 250;
      animRef.current.entityAlpha = 1.0;
    } else if (currentShot.entityState === 'OVERTAKE') {
      animRef.current.targetEntityX = 300;
      animRef.current.entityAlpha = 1.0;
    }

    const timer = setTimeout(() => {
      if (shotIndex < SHOTS.length - 1) {
        setShotIndex((prev) => prev + 1);
      } else {
        handleFinish();
      }
    }, currentShot.durationMs);

    return () => clearTimeout(timer);
  }, [shotIndex]);

  // Real 60 FPS HTML5 Canvas Cinematic Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const currentShot = SHOTS[shotIndex] || SHOTS[0];
      const anim = animRef.current;

      // Smooth entity approach (Never teleports)
      anim.entityX += (anim.targetEntityX - anim.entityX) * (3.5 * dt);
      anim.fogOffset += 40 * dt;
      anim.breathOffset += dt * 3.5;

      // Screen shake calculation
      if (currentShot.cameraShake > 0) {
        anim.shakeX = (Math.random() - 0.5) * currentShot.cameraShake * 2;
        anim.shakeY = (Math.random() - 0.5) * currentShot.cameraShake * 2;
      } else {
        anim.shakeX = 0;
        anim.shakeY = 0;
      }

      // Scroll speed based on player movement
      let speed = 0;
      if (currentShot.playerState === 'JOG') speed = 180;
      else if (currentShot.playerState === 'RUN') speed = 360;
      else if (currentShot.playerState === 'SPRINT_LOOK_BACK') speed = 440;
      anim.gridOffset = (anim.gridOffset + speed * dt) % 80;
      anim.runFrame += dt * (speed > 0 ? 14 : 2);

      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Camera transformation (Zoom & Shake)
      ctx.translate(w / 2 + anim.shakeX, h / 2 + anim.shakeY);
      ctx.scale(currentShot.cameraZoom, currentShot.cameraZoom);
      ctx.translate(-w / 2, -h / 2);

      // 1. Cyber Dark Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.6, '#090d1f');
      bgGrad.addColorStop(1, '#05020c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Distant Corridor Lines (Perspective Grid)
      const horizonY = h * 0.52;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;

      // Vanishing point in center
      const vpX = w * 0.5;
      const vpY = horizonY;

      for (let x = -w * 0.5; x <= w * 1.5; x += 100) {
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal floor lines moving toward camera
      for (let y = horizonY; y < h; y += 22) {
        const lineOffset = (y - horizonY + anim.gridOffset) % 120;
        const actualY = horizonY + lineOffset;
        if (actualY < h) {
          const alpha = Math.min(1, (actualY - horizonY) / 100) * 0.4;
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(0, actualY);
          ctx.lineTo(w, actualY);
          ctx.stroke();
        }
      }

      // Ceiling corridor cables
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      for (let x = -w * 0.2; x <= w * 1.2; x += 150) {
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(x, 0);
        ctx.stroke();
      }

      // 3. Dense Atmospheric Fog
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, horizonY - 40, w, 100);

      // 4. Draw Mysterious Entity using unified renderer
      if (anim.entityAlpha > 0.03) {
        const stance =
          currentShot.entityState === 'CHASE_ACTIVE' || currentShot.entityState === 'OVERTAKE'
            ? 'CHASING'
            : currentShot.entityState === 'APPROACH' || currentShot.entityState === 'CHASE_START'
            ? 'STALKING'
            : currentShot.entityState === 'FAR_GLIMPSE'
            ? 'STANDING'
            : 'STALKING';

        renderConsistentEntity(ctx, anim.entityX, h * 0.68, {
          stance,
          animClock: anim.breathOffset,
          alpha: anim.entityAlpha,
          scale: Math.min(1.4, 0.9 + (anim.entityX / 400) * 0.5),
          facingRight: true,
          showRedAura: true,
        });
      }

      // 5. Draw Player Character (Cyan Runner)
      const pX = anim.playerX;
      const pY = h * 0.68;
      const breathe = Math.sin(anim.breathOffset) * 2;

      ctx.save();
      ctx.translate(pX, pY);

      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 36, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Leg running animation
      const legAngle = Math.sin(anim.runFrame) * 0.6;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      if (currentShot.playerState === 'STAND' || currentShot.playerState === 'LOOK_AROUND') {
        // Standing legs
        ctx.beginPath();
        ctx.moveTo(-6, 15);
        ctx.lineTo(-6, 35);
        ctx.moveTo(6, 15);
        ctx.lineTo(6, 35);
        ctx.stroke();
      } else {
        // Running legs
        ctx.beginPath();
        ctx.moveTo(-4, 15);
        ctx.lineTo(-4 - Math.sin(legAngle) * 16, 35 - Math.cos(legAngle) * 6);
        ctx.moveTo(4, 15);
        ctx.lineTo(4 + Math.sin(legAngle) * 16, 35 + Math.cos(legAngle) * 6);
        ctx.stroke();
      }

      // Torso
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-12, -18 + breathe, 24, 34, 6);
      ctx.fill();

      // Cyber Armor accents
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-8, -10 + breathe, 16, 18);

      // Head & Helmet
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(0, -32 + breathe, 14, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Visor
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';

      if (currentShot.playerState === 'LOOK_AROUND' || currentShot.playerState === 'SPRINT_LOOK_BACK') {
        // Head turned left / looking back at entity
        ctx.beginPath();
        ctx.roundRect(-14, -36 + breathe, 10, 7, 2);
        ctx.fill();
      } else {
        // Facing forward right
        ctx.beginPath();
        ctx.roundRect(2, -36 + breathe, 12, 7, 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.restore();

      // 6. Foreground Neon Particles & Vignette
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [shotIndex]);

  const handleFinish = () => {
    if (dontShowAgain) {
      storage.setHasSeenOpeningCutscene(true);
    }
    sound.setMusicMood('NORMAL');
    onComplete();
  };

  const currentShot = SHOTS[shotIndex] || SHOTS[0];

  return (
    <div
      id="opening-cutscene"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] select-none overflow-hidden"
    >
      {/* 60 FPS HTML5 Canvas Simulation Background - object-contain preserves full 960x540 scene without cropping subjects */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* CRT Scanline & Cinematic Vignette Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20 pt-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-red-500/40 text-red-400 font-mono text-xs tracking-widest uppercase backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          <span>{lang === 'id' ? 'PROLOG // KORIDOR ANOMALI' : 'PROLOGUE // RUNNER AWAKENING'}</span>
        </div>

        <button
          id="btn-skip-cutscene"
          type="button"
          onClick={handleFinish}
          className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 border border-slate-700/80 rounded-full text-slate-300 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all backdrop-blur-md cursor-pointer"
        >
          <span>{lang === 'id' ? 'LEWATI' : 'SKIP'}</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Hero Banner for Shot 10 */}
      {currentShot.titleId && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 bg-black/80 backdrop-blur-md p-8 rounded-3xl border border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.5)] max-w-lg"
          >
            <h1 className="text-4xl sm:text-6xl font-black font-['Chakra_Petch'] tracking-widest text-red-500 uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse">
              {lang === 'id' ? currentShot.titleId : currentShot.titleEn}
            </h1>
            <p className="text-sm sm:text-base font-mono text-slate-200 tracking-widest uppercase">
              {lang === 'id' ? currentShot.dialogueId : currentShot.dialogueEn}
            </p>
          </motion.div>
        </div>
      )}

      {/* Bottom Cinematic Dialogue Box */}
      {!currentShot.titleId && (
        <div className="w-full max-w-2xl z-20 my-auto mb-16 px-4 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={shotIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-black/75 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-center space-y-2"
            >
              <p className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                {lang === 'id' ? 'REKAMAN SUARA' : 'TRANSCRIPT'}
              </p>
              <h2 className="text-base sm:text-xl font-medium text-slate-100 italic leading-relaxed whitespace-pre-line">
                {lang === 'id' ? currentShot.dialogueId : currentShot.dialogueEn}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Footer & Progress */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20 pb-2 border-t border-slate-800/80 pt-3 pointer-events-auto">
        <label className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer">
          <input
            id="checkbox-dont-show-cutscene"
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
          />
          <span>
            {lang === 'id'
              ? 'Jangan tampilkan cutscene lagi saat mulai'
              : 'Do not show opening cutscene automatically'}
          </span>
        </label>

        {/* Shot Dots Indicator */}
        <div className="flex items-center gap-1.5">
          {SHOTS.map((s, idx) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === shotIndex
                  ? 'w-6 bg-cyan-400'
                  : idx < shotIndex
                  ? 'w-2.5 bg-cyan-800'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
