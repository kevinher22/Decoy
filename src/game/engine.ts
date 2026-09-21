import {
  GameState,
  Obstacle,
  Collectible,
  Particle,
  FloatingText,
  SkinId,
  EntitySkinId,
  OrbCosmeticId,
  CollectibleType,
  ObstacleType,
} from '../types';
import { GAME_CONSTANTS } from './constants';
import { renderCharacter, CharacterAction } from './characterRenderer';
import { sound } from '../services/audio';
import { story } from '../services/storyManager';
import { storage } from '../services/storage';
import { securityService, RunSession } from '../services/security';
import { drawRoundRect } from '../utils/canvasHelper';
import { renderConsistentEntity } from './entityVisuals';
import { renderOrbArtefact } from './orbRenderer';

export type EntityEncounterType =
  | 'A_DISTANT_SILHOUETTE'
  | 'B_MOTIONLESS_DISTANCE'
  | 'C_CROSSING_PATH'
  | 'D_BRIEF_STALKER'
  | 'E_PHANTOM_FOOTSTEPS'
  | 'F_LOOK_BACK_REVEAL'
  | 'G_FRAGMENT_APPARITION'
  | 'H_ENVIRONMENTAL_ANOMALY';

export interface ActiveEntityEncounter {
  type: EntityEncounterType;
  timer: number;
  duration: number;
  x: number;
  y: number;
  targetX: number;
  alpha: number;
  maxAlpha: number;
  stance: 'STALKING' | 'CHASING' | 'STANDING' | 'CROSSING' | 'DISSOLVING' | 'GLIDING';
  scale: number;
  facingRight: boolean;
  eyeGlowIntensity: number;
  showRedAura: boolean;
  revealedOnLookBack?: boolean;
}

export interface GameCallbacks {
  onScoreUpdate: (score: number, combo: number, multiplier: number, distance?: number) => void;
  onCoinCollected: (coinsTotal: number, earned: number) => void;
  onGameOver: (
    finalScore: number,
    maxCombo: number,
    coinsEarned: number,
    durationSec: number,
    distance: number,
    newEndingId: string | null,
    newFragments: string[],
    runSessionId?: string
  ) => void;
  onNewRecord: (score: number) => void;
  onAchievementProgress: (event: string, value: number) => void;
  onLookBackAvailabilityChange?: (available: boolean) => void;
  onNewStoryDiscovery?: (title: string, subtitle?: string) => void;
  onEndingTriggered?: (endingId: string) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;

  // Animation Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Game State
  private state: GameState = 'MENU';
  private skinId: SkinId = 'default';
  private entitySkinId: EntitySkinId = 'entity_original';
  private orbCosmeticId: OrbCosmeticId = 'orb_default';
  private invulnerableTimer: number = 0;
  private runDuration: number = 0;
  private score: number = 0;
  private coinsEarnedThisRun: number = 0;
  private comboCount: number = 0;
  private maxComboThisRun: number = 1;
  private comboTimer: number = 0;
  private currentSpeed: number = GAME_CONSTANTS.INITIAL_SPEED;
  private distanceTraveled: number = 0;
  private obstaclesDodgedCount: number = 0;
  private isRecordBeaten: boolean = false;
  private personalBest: number = 0;

  // Player Physics
  private playerY: number = GAME_CONSTANTS.GROUND_Y;
  private playerVy: number = 0;
  private isGrounded: boolean = true;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private characterAction: CharacterAction = 'idle';
  private hitTime: number = 0;

  // Look Back & Mystery System
  private isLookBackAvailable: boolean = false;
  private isLookingBack: boolean = false;
  private lookBackTimer: number = 0;
  private lookBackGlitchAlpha: number = 0;
  private whisperTimer: number = 0;
  private shadowEntityDistance: number = -500; // Entity has disappeared after opening chase
  private currentDangerPhase: 'DAY' | 'SUNSET' | 'NIGHT' | 'NEON' = 'DAY';
  private activeEncounter: ActiveEntityEncounter | null = null;
  private encounterCooldown: number = 0;
  private encounteredMilestones: Set<string> = new Set();

  // Entities
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private nextObstacleSpawnDist: number = 320;
  private nextCollectibleSpawnDist: number = 200;
  private nextEntityId: number = 1;

  // Screen shake & FX
  private shakeIntensity: number = 0;
  private animClock: number = 0;
  private currentRunSession: RunSession | null = null;

  // Settings Cache
  private reducedMotion: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not obtain 2D canvas context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.setupCanvasDimensions();
  }

  public setPersonalBest(best: number): void {
    this.personalBest = best;
  }

  public setSkin(skin: SkinId): void {
    this.skinId = skin;
  }

  public setEntitySkin(skin: EntitySkinId): void {
    this.entitySkinId = skin;
  }

  public setOrbCosmetic(orb: OrbCosmeticId): void {
    this.orbCosmeticId = orb;
  }

  public revivePlayer(): void {
    this.state = 'PLAYING';
    this.characterAction = 'run';
    this.playerY = GAME_CONSTANTS.GROUND_Y;
    this.playerVy = 0;
    this.isGrounded = true;
    this.invulnerableTimer = 3.2; // 3.2 seconds invulnerability barrier
    // Clear any obstacles within 320px in front of the player
    this.obstacles = this.obstacles.filter((o) => o.x > GAME_CONSTANTS.PLAYER_X + 280);
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const spd = 2 + Math.random() * 3;
      this.particles.push({
        x: GAME_CONSTANTS.PLAYER_X + 18,
        y: this.playerY - 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: '#38bdf8',
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 28,
      });
    }
    this.addFloatingText('REVIVED!', GAME_CONSTANTS.PLAYER_X + 18, this.playerY - 45, '#38bdf8', 16);
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  // Responsive Viewport Metrics (Uniform scale preserves exact aspect ratio without distortion)
  public viewportScale: number = 1;
  public viewportOffsetX: number = 0;
  public viewportOffsetY: number = 0;
  public extraWidth: number = 0;
  public extraHeight: number = 0;

  public setupCanvasDimensions(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth =
      rect.width > 0
        ? rect.width
        : this.canvas.parentElement?.clientWidth || GAME_CONSTANTS.BASE_WIDTH;
    const displayHeight =
      rect.height > 0
        ? rect.height
        : this.canvas.parentElement?.clientHeight || GAME_CONSTANTS.BASE_HEIGHT;

    const targetW = Math.max(320, Math.floor(displayWidth * dpr));
    const targetH = Math.max(180, Math.floor(displayHeight * dpr));

    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    // 1. Calculate uniform scale factor: ALWAYS keeps 100% true aspect ratio (no stretching/squashing)
    const scaleX = this.canvas.width / GAME_CONSTANTS.BASE_WIDTH;
    const scaleY = this.canvas.height / GAME_CONSTANTS.BASE_HEIGHT;
    this.viewportScale = Math.min(scaleX, scaleY);

    // 2. Compute letterbox / pillarbox offsets to center the 960x540 gameplay space safely
    this.viewportOffsetX = (this.canvas.width - GAME_CONSTANTS.BASE_WIDTH * this.viewportScale) / 2;
    this.viewportOffsetY = (this.canvas.height - GAME_CONSTANTS.BASE_HEIGHT * this.viewportScale) / 2;

    // 3. Virtual units extended beyond standard 960x540 bounds to fill full device bleed seamlessly
    this.extraWidth = this.viewportScale > 0 ? this.viewportOffsetX / this.viewportScale : 0;
    this.extraHeight = this.viewportScale > 0 ? this.viewportOffsetY / this.viewportScale : 0;
  }

  public applyTransform(): void {
    if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.translate(this.viewportOffsetX, this.viewportOffsetY);
    this.ctx.scale(this.viewportScale, this.viewportScale);
  }

  // --- Controls & Inputs ---

  public handleAction(): void {
    if (this.state !== 'PLAYING' || this.isLookingBack) return;

    this.jumpBufferTimer = 0.12;

    if (this.isGrounded || this.coyoteTimer > 0) {
      this.executeJump();
    }
  }

  public triggerLookBack(): void {
    if (this.state !== 'PLAYING' || this.isLookingBack) return;

    this.isLookingBack = true;
    this.lookBackTimer = 1.0; // 1-second cinematic glance
    this.lookBackGlitchAlpha = 0.85;
    this.characterAction = 'look_back';

    sound.playLookBack();
    sound.playHeartbeat();

    if (navigator.vibrate && storage.getData().settings.vibration) {
      navigator.vibrate([40, 60, 120]);
    }

    // If an encounter is active, adapt or reveal it
    if (!this.activeEncounter) {
      this.triggerEncounter('F_LOOK_BACK_REVEAL');
    } else if (this.activeEncounter.type === 'E_PHANTOM_FOOTSTEPS') {
      this.activeEncounter.maxAlpha = 1.0;
      this.activeEncounter.alpha = 1.0;
      this.activeEncounter.revealedOnLookBack = true;
      this.activeEncounter.showRedAura = true;
    } else {
      this.activeEncounter.eyeGlowIntensity = 1.6;
    }

    // Call story engine quietly (no floating numbers or text)
    const { triggeredEnding } = story.onLookBackTriggered();

    if (triggeredEnding && this.callbacks.onEndingTriggered) {
      this.callbacks.onEndingTriggered(triggeredEnding);
    }
  }

  public triggerEncounter(type: EntityEncounterType): void {
    if (this.state !== 'PLAYING') return;

    // Do not overwrite an existing active encounter or trigger during cooldown unless it's an intentional player LOOK_BACK_REVEAL
    if (type !== 'F_LOOK_BACK_REVEAL') {
      if (this.activeEncounter || this.encounterCooldown > 0) {
        return;
      }
    }

    const groundY = GAME_CONSTANTS.GROUND_Y;

    switch (type) {
      case 'A_DISTANT_SILHOUETTE':
        sound.playBreathing();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 3.8,
          x: GAME_CONSTANTS.PLAYER_X - 180,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X - 140,
          alpha: 0,
          maxAlpha: 0.5,
          stance: 'GLIDING',
          scale: 0.95,
          facingRight: true,
          eyeGlowIntensity: 0.8,
          showRedAura: true,
        };
        break;

      case 'B_MOTIONLESS_DISTANCE':
        sound.playGlitch();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 2.8,
          x: GAME_CONSTANTS.BASE_WIDTH - 60,
          y: groundY,
          targetX: -120,
          alpha: 0,
          maxAlpha: 0.75,
          stance: 'STANDING',
          scale: 1.05,
          facingRight: false,
          eyeGlowIntensity: 1.0,
          showRedAura: true,
        };
        break;

      case 'C_CROSSING_PATH':
        sound.playWhisper();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 1.8,
          x: -50,
          y: groundY,
          targetX: GAME_CONSTANTS.BASE_WIDTH + 80,
          alpha: 0,
          maxAlpha: 0.85,
          stance: 'CROSSING',
          scale: 1.0,
          facingRight: true,
          eyeGlowIntensity: 1.1,
          showRedAura: true,
        };
        break;

      case 'D_BRIEF_STALKER':
        sound.playHeartbeat();
        sound.playBreathing();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 4.2,
          x: -60,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X - 60,
          alpha: 0,
          maxAlpha: 0.95,
          stance: 'STALKING',
          scale: 1.1,
          facingRight: true,
          eyeGlowIntensity: 1.2,
          showRedAura: true,
        };
        break;

      case 'E_PHANTOM_FOOTSTEPS':
        sound.playWhisper();
        sound.playBreathing();
        this.triggerScreenShake(3);
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 3.5,
          x: GAME_CONSTANTS.PLAYER_X - 65,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X - 55,
          alpha: 0,
          maxAlpha: 0, // invisible unless revealed on look back!
          stance: 'STALKING',
          scale: 1.05,
          facingRight: true,
          eyeGlowIntensity: 1.0,
          showRedAura: false,
          revealedOnLookBack: false,
        };
        break;

      case 'F_LOOK_BACK_REVEAL':
        sound.playGlitch();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 1.2,
          x: GAME_CONSTANTS.PLAYER_X - 65,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X - 55,
          alpha: 0,
          maxAlpha: 1.0,
          stance: 'STALKING',
          scale: 1.2,
          facingRight: true,
          eyeGlowIntensity: 1.6,
          showRedAura: true,
          revealedOnLookBack: true,
        };
        break;

      case 'G_FRAGMENT_APPARITION':
        sound.playWhisper();
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 2.6,
          x: GAME_CONSTANTS.PLAYER_X + 45,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X + 75,
          alpha: 0,
          maxAlpha: 0.7,
          stance: 'GLIDING',
          scale: 0.9,
          facingRight: false,
          eyeGlowIntensity: 0.9,
          showRedAura: true,
        };
        break;

      case 'H_ENVIRONMENTAL_ANOMALY':
        sound.playHeartbeat();
        sound.playGlitch();
        this.triggerScreenShake(4.5);
        this.lookBackGlitchAlpha = 0.5;
        this.activeEncounter = {
          type,
          timer: 0,
          duration: 3.5,
          x: GAME_CONSTANTS.PLAYER_X - 110,
          y: groundY,
          targetX: GAME_CONSTANTS.PLAYER_X - 90,
          alpha: 0,
          maxAlpha: 0.85,
          stance: 'STANDING',
          scale: 1.1,
          facingRight: true,
          eyeGlowIntensity: 1.4,
          showRedAura: true,
        };
        break;
    }
  }

  private executeJump(): void {
    this.playerVy = GAME_CONSTANTS.JUMP_FORCE;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.characterAction = 'jump';

    sound.playJump();

    const particlesEnabled = storage.getData().settings.particles && !this.reducedMotion;
    if (particlesEnabled) {
      for (let i = 0; i < 7; i++) {
        this.particles.push({
          x: GAME_CONSTANTS.PLAYER_X - 10 + Math.random() * 20,
          y: GAME_CONSTANTS.GROUND_Y + 12,
          vx: -2 - Math.random() * 3,
          vy: -1 - Math.random() * 2,
          color: 'rgba(103, 232, 249, 0.7)',
          size: 3 + Math.random() * 3,
          alpha: 1,
          life: 0,
          maxLife: 0.25,
          shape: 'circle',
        });
      }
    }
  }

  // --- Game Lifecycle ---

  public start(): void {
    this.stop();

    this.state = 'PLAYING';
    this.isPaused = false;
    this.isRunning = true;
    this.runDuration = 0;
    this.score = 0;
    this.coinsEarnedThisRun = 0;
    this.comboCount = 0;
    this.maxComboThisRun = 1;
    this.comboTimer = 0;
    this.currentSpeed = GAME_CONSTANTS.INITIAL_SPEED;
    this.distanceTraveled = 0;
    this.obstaclesDodgedCount = 0;
    this.isRecordBeaten = false;
    this.currentDangerPhase = 'DAY';

    this.playerY = GAME_CONSTANTS.GROUND_Y;
    this.playerVy = 0;
    this.isGrounded = true;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.characterAction = 'run';
    this.hitTime = 0;

    this.isLookingBack = false;
    this.lookBackTimer = 0;
    this.lookBackGlitchAlpha = 0;
    this.whisperTimer = 14;
    this.isLookBackAvailable = false;
    this.shadowEntityDistance = -500;
    this.activeEncounter = null;
    this.encounterCooldown = 6.0; // Give a grace period before encounters begin
    this.encounteredMilestones.clear();

    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.nextObstacleSpawnDist = 380;
    this.nextCollectibleSpawnDist = 200;
    this.shakeIntensity = 0;

    story.resetRunState();
    sound.setMusicMood('NORMAL');

    // Create unique, non-reusable run session ticket
    this.currentRunSession = securityService.createRunSession();

    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);

    this.callbacks.onAchievementProgress('game_started', 1);
  }

  public pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    // Render one crisp paused frame
    this.render();
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      if (!this.animFrameId && this.isRunning) {
        this.animFrameId = requestAnimationFrame(this.loop);
      }
    }
  }

  public handleVisibilityChange(isVisible: boolean): void {
    if (!isVisible) {
      if (this.isRunning && !this.isPaused) {
        this.pause();
      }
    } else {
      this.setupCanvasDimensions();
      this.lastTime = performance.now();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public renderMenuPreview(): void {
    this.animClock += 0.016;

    // Clear whole physical canvas buffer in dark ambient void
    this.ctx.save();
    if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.fillStyle = '#070913';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.applyTransform();
    this.ctx.save();
    this.drawBackground(0);
    this.drawGround();
    renderCharacter(
      this.ctx,
      GAME_CONSTANTS.PLAYER_X,
      GAME_CONSTANTS.GROUND_Y,
      'run',
      this.skinId,
      this.animClock
    );
    this.ctx.restore();
  }

  // --- Main Loop ---

  private loop = (timestamp: number): void => {
    if (!this.isRunning || this.isPaused) {
      this.animFrameId = null;
      return;
    }

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    if (this.isRunning && !this.isPaused) {
      this.animFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animFrameId = null;
    }
  };

  // --- Update Step ---

  private update(dt: number): void {
    this.animClock += dt;

    if (this.state === 'PLAYING') {
      // Handle Look Back state
      let effectiveDt = dt;
      if (this.isLookingBack) {
        effectiveDt = dt * 0.15; // Extreme slow motion during Look Back
        this.lookBackTimer -= dt;
        if (this.lookBackTimer <= 0) {
          this.isLookingBack = false;
          this.characterAction = 'run';
        }
      }

      this.runDuration += effectiveDt;
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= effectiveDt;
      }

      // 1. Difficulty & Speed Scaling
      this.currentSpeed = Math.min(
        GAME_CONSTANTS.MAX_SPEED,
        GAME_CONSTANTS.INITIAL_SPEED + this.runDuration * GAME_CONSTANTS.SPEED_ACCELERATION
      );

      const frameDist = this.currentSpeed * 60 * effectiveDt;
      this.distanceTraveled += frameDist;

      // Distance milestones & fragment checks
      story.onDistanceProgress(this.distanceTraveled);

      // Distance milestones triggering unique story encounters
      if (this.distanceTraveled >= 450 && !this.encounteredMilestones.has('dist_450')) {
        this.encounteredMilestones.add('dist_450');
        this.triggerEncounter('A_DISTANT_SILHOUETTE');
      } else if (this.distanceTraveled >= 1100 && !this.encounteredMilestones.has('dist_1100')) {
        this.encounteredMilestones.add('dist_1100');
        this.triggerEncounter('B_MOTIONLESS_DISTANCE');
      } else if (this.distanceTraveled >= 2300 && !this.encounteredMilestones.has('dist_2300')) {
        this.encounteredMilestones.add('dist_2300');
        this.triggerEncounter('E_PHANTOM_FOOTSTEPS');
      }

      // Check danger phases with Special Encounters
      if (this.runDuration > GAME_CONSTANTS.THEME_THRESHOLDS.NEON && this.currentDangerPhase !== 'NEON') {
        this.currentDangerPhase = 'NEON';
        sound.setMusicMood('INTENSE');
        story.onDangerPhaseEntered('NEON');
        this.addFloatingText('CYBER HORIZON REACHED ⚡', GAME_CONSTANTS.BASE_WIDTH / 2, 80, '#facc15', 18);
        this.triggerEncounter('C_CROSSING_PATH');
      } else if (
        this.runDuration > GAME_CONSTANTS.THEME_THRESHOLDS.NIGHT &&
        this.currentDangerPhase !== 'NIGHT' &&
        this.currentDangerPhase !== 'NEON'
      ) {
        this.currentDangerPhase = 'NIGHT';
        sound.setMusicMood('DANGER');
        story.onDangerPhaseEntered('NIGHT');
        this.addFloatingText('NIGHTMARE DEPTHS 🌙', GAME_CONSTANTS.BASE_WIDTH / 2, 80, '#c084fc', 18);
        this.triggerEncounter('H_ENVIRONMENTAL_ANOMALY');
      }

      // Check periodic whispers & look back availability
      this.whisperTimer -= effectiveDt;
      if (this.whisperTimer <= 0) {
        this.whisperTimer = 18 + Math.random() * 12;
        sound.playWhisper();

        // Reveal look back availability prompt
        const nextAvail = true;
        if (nextAvail !== this.isLookBackAvailable) {
          this.isLookBackAvailable = nextAvail;
          this.callbacks.onLookBackAvailabilityChange?.(this.isLookBackAvailable);
        }
      }

      // Update Active Entity Encounter (Movement, Alpha, Lifespan, and Disappearance)
      if (this.activeEncounter) {
        const enc = this.activeEncounter;
        enc.timer += effectiveDt;

        // Smooth position interpolation
        enc.x += (enc.targetX - enc.x) * (2.8 * effectiveDt);

        // Alpha fade in and fade out
        if (enc.type !== 'E_PHANTOM_FOOTSTEPS' || enc.revealedOnLookBack) {
          if (enc.timer < 0.4) {
            enc.alpha = Math.min(enc.maxAlpha, (enc.timer / 0.4) * enc.maxAlpha);
          } else if (enc.timer > enc.duration - 0.6) {
            enc.alpha = Math.max(0, ((enc.duration - enc.timer) / 0.6) * enc.maxAlpha);
          } else {
            enc.alpha = enc.maxAlpha;
          }
        }

        // When encounter expires: ENTITY DISAPPEARS
        if (enc.timer >= enc.duration) {
          this.activeEncounter = null;
          this.encounterCooldown = 12.0; // Cooldown before another apparition can spontaneously trigger
        }
      }

      // Decay encounter cooldown
      if (this.encounterCooldown > 0) {
        this.encounterCooldown -= effectiveDt;
      }

      // 2. Score progression
      const prevScore = this.score;
      this.score += GAME_CONSTANTS.SURVIVAL_SCORE_PER_SEC * this.getMultiplier() * effectiveDt;

      // Record check
      if (this.personalBest > 0 && this.score > this.personalBest && !this.isRecordBeaten) {
        this.isRecordBeaten = true;
        sound.playNewRecord();
        this.callbacks.onNewRecord(Math.floor(this.score));
        this.addFloatingText(
          '🔥 NEW RECORD!',
          GAME_CONSTANTS.PLAYER_X + 20,
          GAME_CONSTANTS.GROUND_Y - 80,
          '#facc15',
          22
        );
      }

      if (Math.floor(this.score) !== Math.floor(prevScore)) {
        this.callbacks.onScoreUpdate(
          Math.floor(this.score),
          this.comboCount,
          this.getMultiplier(),
          Math.floor(this.distanceTraveled)
        );
      }

      // Achievements
      this.callbacks.onAchievementProgress('survival_time', this.runDuration);
      this.callbacks.onAchievementProgress('current_score', Math.floor(this.score));

      // 3. Player Physics
      this.updatePlayerPhysics(effectiveDt);

      // 4. Combo Decay
      if (this.comboCount > 0) {
        this.comboTimer -= effectiveDt * 1000;
        if (this.comboTimer <= 0) {
          this.comboCount = 0;
          this.callbacks.onScoreUpdate(Math.floor(this.score), 0, 1);
        }
      }

      // 5. Spawning
      this.handleSpawning(frameDist);

      // 6. Obstacles Update & Collision
      this.updateObstacles(frameDist);

      // 7. Collectibles Update & Collection
      this.updateCollectibles(frameDist);

      // Check pending story notifications
      const notifs = story.getPendingNotifications();
      for (const n of notifs) {
        this.callbacks.onNewStoryDiscovery?.(n.title, n.subtitle);
      }
    } else if (this.state === 'GAME_OVER') {
      this.hitTime += dt;
      this.playerY += this.playerVy;
      this.playerVy += GAME_CONSTANTS.GRAVITY * 0.8;
      if (this.playerY > GAME_CONSTANTS.GROUND_Y + 40) {
        this.playerY = GAME_CONSTANTS.GROUND_Y + 40;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt * 60;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Glitch alpha decay
    if (this.lookBackGlitchAlpha > 0) {
      this.lookBackGlitchAlpha -= dt * 1.5;
      if (this.lookBackGlitchAlpha < 0) this.lookBackGlitchAlpha = 0;
    }

    // Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= GAME_CONSTANTS.SHAKE_DECAY;
      if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
    }
  }

  private updatePlayerPhysics(dt: number): void {
    this.playerVy += GAME_CONSTANTS.GRAVITY;
    this.playerY += this.playerVy;

    // Ground check
    if (this.playerY >= GAME_CONSTANTS.GROUND_Y) {
      this.playerY = GAME_CONSTANTS.GROUND_Y;
      this.playerVy = 0;

      if (!this.isGrounded) {
        this.isGrounded = true;
        if (!this.isLookingBack) {
          this.characterAction = 'run';
        }

        const particlesEnabled = storage.getData().settings.particles && !this.reducedMotion;
        if (particlesEnabled) {
          for (let i = 0; i < 4; i++) {
            this.particles.push({
              x: GAME_CONSTANTS.PLAYER_X - 6 + Math.random() * 12,
              y: GAME_CONSTANTS.GROUND_Y + 12,
              vx: (Math.random() - 0.5) * 4,
              vy: -0.5 - Math.random() * 1.5,
              color: 'rgba(255, 255, 255, 0.5)',
              size: 2 + Math.random() * 2,
              alpha: 0.8,
              life: 0,
              maxLife: 0.2,
              shape: 'circle',
            });
          }
        }

        if (this.jumpBufferTimer > 0) {
          this.executeJump();
        }
      }
    } else {
      this.isGrounded = false;
      this.coyoteTimer -= dt;
      this.jumpBufferTimer -= dt;
      if (!this.isLookingBack) {
        this.characterAction = 'jump';
      }
    }
  }

  private handleSpawning(frameDist: number): void {
    // 1. Obstacle Spawning
    this.nextObstacleSpawnDist -= frameDist;
    if (this.nextObstacleSpawnDist <= 0) {
      this.spawnObstacle();

      const baseSpacing = Math.max(
        GAME_CONSTANTS.MIN_OBSTACLE_SPACING,
        GAME_CONSTANTS.MAX_OBSTACLE_SPACING - this.runDuration * 2.2
      );
      this.nextObstacleSpawnDist = baseSpacing + Math.random() * 160;
    }

    // 2. Collectible Spawning
    this.nextCollectibleSpawnDist -= frameDist;
    if (this.nextCollectibleSpawnDist <= 0) {
      this.spawnCollectible();
      this.nextCollectibleSpawnDist = 180 + Math.random() * 240;
    }
  }

  private spawnObstacle(): void {
    const isLateGame = this.runDuration > 25;
    const isVeryLate = this.runDuration > 55;

    let type: ObstacleType = 'BARRIER_LOW';
    const rand = Math.random();

    if (isVeryLate) {
      if (rand < 0.35) type = 'BARRIER_LOW';
      else if (rand < 0.6) type = 'BARRIER_TALL';
      else if (rand < 0.85) type = 'LASER_HIGH';
      else type = 'ENERGY_GATE';
    } else if (isLateGame) {
      if (rand < 0.5) type = 'BARRIER_LOW';
      else if (rand < 0.8) type = 'BARRIER_TALL';
      else type = 'LASER_HIGH';
    } else {
      type = 'BARRIER_LOW';
    }

    let width = 28;
    let height = 36;
    let y = GAME_CONSTANTS.GROUND_Y + 12 - height;

    if (type === 'BARRIER_TALL') {
      width = 30;
      height = 54;
      y = GAME_CONSTANTS.GROUND_Y + 12 - height;
    } else if (type === 'LASER_HIGH') {
      width = 44;
      height = 20;
      y = GAME_CONSTANTS.GROUND_Y - 55;
    } else if (type === 'ENERGY_GATE') {
      width = 24;
      height = 48;
      y = GAME_CONSTANTS.GROUND_Y + 12 - height;
    }

    this.obstacles.push({
      id: this.nextEntityId++,
      x: GAME_CONSTANTS.BASE_WIDTH + 50,
      y,
      width,
      height,
      type,
      passed: false,
      nearMissAwarded: false,
      state: 0,
    });
  }

  private spawnCollectible(): void {
    const rand = Math.random();
    let type: CollectibleType = 'NORMAL';
    let value: number = GAME_CONSTANTS.COIN_VALUES.NORMAL;
    let coinReward: number = GAME_CONSTANTS.COIN_REWARDS.NORMAL;

    // Mystery and Rare Spawns
    if (rand > 0.94) {
      type = 'MEMORY_SHARD';
      value = GAME_CONSTANTS.COIN_VALUES.MEMORY_SHARD;
      coinReward = GAME_CONSTANTS.COIN_REWARDS.MEMORY_SHARD;
    } else if (rand > 0.88 && this.runDuration > 20) {
      type = 'CORRUPTED_ANOMALY';
      value = GAME_CONSTANTS.COIN_VALUES.CORRUPTED_ANOMALY;
      coinReward = GAME_CONSTANTS.COIN_REWARDS.CORRUPTED_ANOMALY;
    } else if (rand > 0.8) {
      type = 'PERFECT';
      value = GAME_CONSTANTS.COIN_VALUES.PERFECT;
      coinReward = GAME_CONSTANTS.COIN_REWARDS.PERFECT;
    } else if (rand > 0.6) {
      type = 'RARE';
      value = GAME_CONSTANTS.COIN_VALUES.RARE;
      coinReward = GAME_CONSTANTS.COIN_REWARDS.RARE;
    }

    const elevated = Math.random() > 0.5;
    const y = elevated ? GAME_CONSTANTS.GROUND_Y - 45 : GAME_CONSTANTS.GROUND_Y - 6;

    this.collectibles.push({
      id: this.nextEntityId++,
      x: GAME_CONSTANTS.BASE_WIDTH + 40,
      y,
      width: 24,
      height: 24,
      type,
      value,
      coinReward,
      collected: false,
      bobOffset: Math.random() * Math.PI * 2,
      rotation: 0,
    });
  }

  private updateObstacles(frameDist: number): void {
    const px = GAME_CONSTANTS.PLAYER_X - 10;
    const py = this.playerY - 22;
    const pw = 20;
    const ph = 34;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= frameDist;
      obs.state += 0.05;

      // Check Collision
      const collides =
        px < obs.x + obs.width &&
        px + pw > obs.x &&
        py < obs.y + obs.height &&
        py + ph > obs.y;

      if (collides) {
        if (this.invulnerableTimer > 0) {
          continue;
        }
        this.triggerGameOver();
        return;
      }

      // Check Near-Miss
      if (!obs.nearMissAwarded && !obs.passed && obs.x < px) {
        const dist = Math.hypot(
          px + pw / 2 - (obs.x + obs.width / 2),
          py + ph / 2 - (obs.y + obs.height / 2)
        );

        if (dist <= GAME_CONSTANTS.NEAR_MISS_DISTANCE + 24) {
          obs.nearMissAwarded = true;
          this.triggerNearMiss(obs.x, obs.y);
        }
      }

      // Passed check
      if (!obs.passed && obs.x + obs.width < px) {
        obs.passed = true;
        this.obstaclesDodgedCount++;
        this.score += GAME_CONSTANTS.OBSTACLE_DODGE_SCORE * this.getMultiplier();
        this.addCombo();
        story.onObstacleDodged(false, this.currentSpeed);
        this.callbacks.onAchievementProgress('obstacles_dodged', this.obstaclesDodgedCount);
      }

      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updateCollectibles(frameDist: number): void {
    const px = GAME_CONSTANTS.PLAYER_X;
    const py = this.playerY;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= frameDist;
      col.rotation += 0.05;

      const dist = Math.hypot(px - col.x, py - col.y);
      if (dist < 34 && !col.collected) {
        col.collected = true;
        this.collectOrb(col);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private collectOrb(col: Collectible): void {
    sound.playCollectible(col.type);

    if (col.type === 'MEMORY_SHARD' || col.type === 'CORRUPTED_ANOMALY') {
      story.onAnomalyCollected(col.type);
      if (col.type === 'MEMORY_SHARD') {
        this.triggerEncounter('G_FRAGMENT_APPARITION');
      } else {
        this.triggerEncounter('D_BRIEF_STALKER');
      }
    }

    const earnedCoins = col.coinReward;
    this.coinsEarnedThisRun += earnedCoins;
    const earnedScore = col.value * this.getMultiplier();
    this.score += earnedScore;

    this.addCombo();

    // Visual feedback
    let color = '#38bdf8';
    let label = `+${col.value}`;
    if (col.type === 'PERFECT') color = '#facc15';
    else if (col.type === 'RARE') color = '#c084fc';
    else if (col.type === 'MEMORY_SHARD') {
      color = '#e0f2fe';
      label = `+${col.value} MEMORY`;
    } else if (col.type === 'CORRUPTED_ANOMALY') {
      color = '#a855f7';
      label = `+${col.value} ANOMALY`;
    }

    this.addFloatingText(label, col.x, col.y - 10, color, col.type === 'MEMORY_SHARD' ? 18 : 16);

    const particlesEnabled = storage.getData().settings.particles && !this.reducedMotion;
    if (particlesEnabled) {
      const count = col.type === 'PERFECT' || col.type === 'MEMORY_SHARD' ? 14 : 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const spd = 2 + Math.random() * 3;
        this.particles.push({
          x: col.x,
          y: col.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color,
          size: 3 + Math.random() * 2,
          alpha: 1,
          life: 0,
          maxLife: 0.35,
          shape: 'spark',
        });
      }
    }

    this.callbacks.onCoinCollected(this.coinsEarnedThisRun, earnedCoins);
    this.callbacks.onAchievementProgress('coins_collected', this.coinsEarnedThisRun);
  }

  private triggerNearMiss(x: number, y: number): void {
    sound.playNearMiss();
    story.onObstacleDodged(true, this.currentSpeed);

    if (navigator.vibrate && storage.getData().settings.vibration) {
      navigator.vibrate(30);
    }

    this.score += GAME_CONSTANTS.NEAR_MISS_BONUS_SCORE * this.getMultiplier();
    this.addCombo();

    this.triggerScreenShake(3.5);
    this.addFloatingText('NEAR MISS! ⚡', x, y - 20, '#38bdf8', 15);
  }

  private addCombo(): void {
    this.comboCount++;
    this.comboTimer = GAME_CONSTANTS.COMBO_TIMEOUT_MS;
    if (this.comboCount > this.maxComboThisRun) {
      this.maxComboThisRun = this.comboCount;
    }

    const mult = this.getMultiplier();
    story.onComboMilestone(mult);

    if (this.comboCount % 5 === 0) {
      sound.playCombo(mult);
      this.addFloatingText(
        `COMBO x${mult}! 🔥`,
        GAME_CONSTANTS.PLAYER_X + 30,
        this.playerY - 50,
        '#f59e0b',
        18
      );
    }

    this.callbacks.onScoreUpdate(
      Math.floor(this.score),
      this.comboCount,
      mult,
      Math.floor(this.distanceTraveled)
    );
    this.callbacks.onAchievementProgress('max_combo', this.maxComboThisRun);
  }

  public getDistance(): number {
    return Math.floor(this.distanceTraveled);
  }

  public isLookBackReady(): boolean {
    return this.isLookBackAvailable;
  }

  public getMultiplier(): number {
    if (this.comboCount >= 20) return 6;
    if (this.comboCount >= 15) return 5;
    if (this.comboCount >= 10) return 4;
    if (this.comboCount >= 6) return 3;
    if (this.comboCount >= 3) return 2;
    return 1;
  }

  private triggerScreenShake(intensity: number): void {
    if (this.reducedMotion || !storage.getData().settings.screenShake) return;
    this.shakeIntensity = Math.min(GAME_CONSTANTS.MAX_SHAKE_INTENSITY, intensity);
  }

  private addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number
  ): void {
    this.floatingTexts.push({
      id: this.nextEntityId++,
      text,
      x,
      y,
      color,
      fontSize,
      alpha: 1,
      vy: -1.2,
    });
  }

  private triggerGameOver(): void {
    this.state = 'GAME_OVER';
    this.characterAction = 'hit';
    this.playerVy = -8;
    this.triggerScreenShake(9);

    if (navigator.vibrate && storage.getData().settings.vibration) {
      navigator.vibrate([60, 40, 100]);
    }

    sound.playHit();
    setTimeout(() => sound.playGameOver(), 120);

    const particlesEnabled = storage.getData().settings.particles && !this.reducedMotion;
    if (particlesEnabled) {
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 5;
        this.particles.push({
          x: GAME_CONSTANTS.PLAYER_X,
          y: this.playerY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
          size: 3 + Math.random() * 4,
          alpha: 1,
          life: 0,
          maxLife: 0.5,
          shape: 'square',
        });
      }
    }

    // Evaluate Run Completion in Story Manager
    const { newlyUnlockedEnding, newlyUnlockedFragments } = story.evaluateRunCompletion(
      Math.floor(this.score),
      this.distanceTraveled,
      this.runDuration,
      this.maxComboThisRun
    );

    const sessionId = this.currentRunSession?.sessionId;
    setTimeout(() => {
      this.callbacks.onGameOver(
        Math.floor(this.score),
        this.maxComboThisRun,
        this.coinsEarnedThisRun,
        this.runDuration,
        Math.floor(this.distanceTraveled),
        newlyUnlockedEnding,
        newlyUnlockedFragments,
        sessionId
      );
    }, 450);
  }

  // --- Rendering ---

  private render(): void {
    // Clear whole physical canvas buffer in dark ambient void
    this.ctx.save();
    if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.fillStyle = '#070913';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.applyTransform();
    this.ctx.save();

    // Screen Shake
    if (this.shakeIntensity > 0 && !this.reducedMotion && storage.getData().settings.screenShake) {
      const sx = (Math.random() * 2 - 1) * this.shakeIntensity;
      const sy = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.ctx.translate(sx, sy);
    }

    // Look Back perspective camera glance
    if (this.isLookingBack) {
      const lookProgress = Math.sin((1 - this.lookBackTimer / 1.0) * Math.PI);
      this.ctx.translate(lookProgress * 45, 0);
      this.ctx.scale(1 + lookProgress * 0.05, 1 + lookProgress * 0.05);
    }

    // 1. Background & Theme Transition
    this.drawBackground(this.runDuration);

    // 2. Parallax Grid & Stars
    this.drawParallaxElements();

    // 3. Shadow Entity Stalking Behind Player
    this.drawShadowEntity();

    // 4. Ground Track
    this.drawGround();

    // 5. Obstacles
    this.drawObstacles();

    // 6. Collectibles
    this.drawCollectibles();

    // 7. Particles
    this.drawParticles();

    // 8. Player Character
    if (this.invulnerableTimer > 0) {
      this.ctx.save();
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + Math.sin(this.animClock * 20) * 0.4})`;
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(GAME_CONSTANTS.PLAYER_X + 18, this.playerY - 10, 32, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    renderCharacter(
      this.ctx,
      GAME_CONSTANTS.PLAYER_X,
      this.playerY,
      this.characterAction,
      this.skinId,
      this.animClock
    );

    // 9. Floating Texts
    this.drawFloatingTexts();

    // 10. Look Back Glitch Overlay
    if (this.lookBackGlitchAlpha > 0) {
      this.drawGlitchOverlay();
    }

    this.ctx.restore();
  }

  private drawBackground(time: number): void {
    const startX = -this.extraWidth;
    const endX = GAME_CONSTANTS.BASE_WIDTH + this.extraWidth;
    const startY = -this.extraHeight;
    const endY = GAME_CONSTANTS.BASE_HEIGHT + this.extraHeight;

    let topColor = '#0b0f19';
    let btmColor = '#1e1b4b';

    if (time < GAME_CONSTANTS.THEME_THRESHOLDS.SUNSET) {
      topColor = '#0f172a';
      btmColor = '#1e293b';
    } else if (time < GAME_CONSTANTS.THEME_THRESHOLDS.NIGHT) {
      topColor = '#1f132b';
      btmColor = '#4a154b';
    } else if (time < GAME_CONSTANTS.THEME_THRESHOLDS.NEON) {
      topColor = '#070913';
      btmColor = '#111827';
    } else {
      topColor = '#080112';
      btmColor = '#2b0938';
    }

    const grad = this.ctx.createLinearGradient(0, startY, 0, endY);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, btmColor);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(startX, startY, endX - startX, endY - startY);
  }

  private drawParallaxElements(): void {
    const startX = -this.extraWidth;
    const endX = GAME_CONSTANTS.BASE_WIDTH + this.extraWidth;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    const gridOffset = (this.distanceTraveled * 0.25) % 40;
    const firstCol = Math.floor(startX / 40) * 40 - gridOffset;
    for (let x = firstCol; x < endX; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 180);
      this.ctx.lineTo(x, GAME_CONSTANTS.GROUND_Y);
      this.ctx.stroke();
    }

    for (let y = 200; y < GAME_CONSTANTS.GROUND_Y; y += 35) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawShadowEntity(): void {
    if (!this.activeEncounter || this.activeEncounter.alpha <= 0.01) return;

    const enc = this.activeEncounter;
    renderConsistentEntity(this.ctx, enc.x, enc.y, {
      stance: enc.stance,
      animClock: this.animClock,
      alpha: enc.alpha,
      scale: enc.scale,
      facingRight: enc.facingRight,
      eyeGlowIntensity: enc.eyeGlowIntensity,
      showRedAura: enc.showRedAura,
      entitySkinId: this.entitySkinId,
    });
  }

  private drawGround(): void {
    const startX = -this.extraWidth;
    const endX = GAME_CONSTANTS.BASE_WIDTH + this.extraWidth;
    const groundY = GAME_CONSTANTS.GROUND_Y + 12;
    const bottomY = GAME_CONSTANTS.BASE_HEIGHT + this.extraHeight;

    this.ctx.save();
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(startX, groundY, endX - startX, bottomY - groundY);

    this.ctx.strokeStyle = '#06b6d4';
    this.ctx.shadowColor = '#06b6d4';
    this.ctx.shadowBlur = 8;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, groundY);
    this.ctx.lineTo(endX, groundY);
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    this.ctx.lineWidth = 2;
    const tickOffset = (this.distanceTraveled * 0.8) % 30;
    const firstTick = Math.floor(startX / 30) * 30 - tickOffset;
    for (let x = firstTick; x < endX; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, groundY + 2);
      this.ctx.lineTo(x - 8, groundY + 16);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawObstacles(): void {
    for (const obs of this.obstacles) {
      this.ctx.save();
      if (obs.type === 'BARRIER_LOW' || obs.type === 'BARRIER_TALL') {
        this.ctx.fillStyle = '#ef4444';
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();
        this.ctx.moveTo(obs.x + obs.width / 2, obs.y);
        this.ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        this.ctx.lineTo(obs.x, obs.y + obs.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#fee2e2';
        this.ctx.beginPath();
        this.ctx.moveTo(obs.x + obs.width / 2, obs.y + 6);
        this.ctx.lineTo(obs.x + obs.width - 6, obs.y + obs.height - 2);
        this.ctx.lineTo(obs.x + 6, obs.y + obs.height - 2);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (obs.type === 'LASER_HIGH') {
        this.ctx.fillStyle = '#f97316';
        this.ctx.shadowColor = '#f97316';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        drawRoundRect(this.ctx, obs.x, obs.y, obs.width, obs.height, 4);
        this.ctx.fill();

        const pulse = (Math.sin(obs.state * 10) + 1) * 0.5;
        this.ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + pulse * 0.4})`;
        this.ctx.fillRect(obs.x + 8, obs.y + obs.height, obs.width - 16, 14);
      } else if (obs.type === 'ENERGY_GATE') {
        this.ctx.fillStyle = '#a855f7';
        this.ctx.shadowColor = '#a855f7';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        drawRoundRect(this.ctx, obs.x, obs.y, obs.width, obs.height, 6);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  private drawCollectibles(): void {
    for (const col of this.collectibles) {
      this.ctx.save();
      const bob = Math.sin(this.animClock * 6 + col.bobOffset) * 4;
      const cy = col.y + bob;

      let color = '#38bdf8';
      let aura = 'rgba(56, 189, 248, 0.4)';

      if (col.type === 'PERFECT') {
        color = '#facc15';
        aura = 'rgba(250, 204, 21, 0.6)';
      } else if (col.type === 'RARE') {
        color = '#c084fc';
        aura = 'rgba(192, 132, 252, 0.5)';
      } else if (col.type === 'MEMORY_SHARD') {
        color = '#e0f2fe';
        aura = 'rgba(224, 242, 254, 0.8)';
      } else if (col.type === 'CORRUPTED_ANOMALY') {
        color = '#a855f7';
        aura = 'rgba(168, 85, 247, 0.7)';
      }

      this.ctx.translate(col.x, cy);
      this.ctx.rotate(col.rotation);

      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 14;

      if (col.type === 'PERFECT') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(10, 0);
        this.ctx.lineTo(0, 10);
        this.ctx.lineTo(-10, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (col.type === 'MEMORY_SHARD') {
        // Glowing prismatic memory crystal
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -13);
        this.ctx.lineTo(8, -2);
        this.ctx.lineTo(0, 13);
        this.ctx.lineTo(-8, -2);
        this.ctx.closePath();
        this.ctx.fill();

        // Inner core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (col.type === 'CORRUPTED_ANOMALY') {
        // Pulsing dark void orb
        this.ctx.fillStyle = '#2e1065';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else {
        if (this.orbCosmeticId && this.orbCosmeticId !== 'orb_default') {
          renderOrbArtefact(this.ctx, 0, 0, this.orbCosmeticId, this.animClock, 0.75);
        } else {
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, col.type === 'RARE' ? 9 : 7, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.ctx.restore();
    }
  }

  private drawParticles(): void {
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  private drawFloatingTexts(): void {
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.fillStyle = ft.color;
      this.ctx.font = `bold ${ft.fontSize}px 'Chakra Petch', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  private drawGlitchOverlay(): void {
    const startX = -this.extraWidth;
    const endX = GAME_CONSTANTS.BASE_WIDTH + this.extraWidth;
    const startY = -this.extraHeight;
    const endY = GAME_CONSTANTS.BASE_HEIGHT + this.extraHeight;
    const totalW = endX - startX;
    const totalH = endY - startY;

    this.ctx.save();
    this.ctx.globalAlpha = this.lookBackGlitchAlpha * 0.45;

    // Scanlines
    this.ctx.fillStyle = '#ff0055';
    this.ctx.fillRect(startX, startY + Math.random() * totalH, totalW, 6);
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(startX, startY + Math.random() * totalH, totalW, 4);

    // Dark vignette centered on view
    const centerX = GAME_CONSTANTS.BASE_WIDTH / 2;
    const centerY = GAME_CONSTANTS.BASE_HEIGHT / 2;
    const grad = this.ctx.createRadialGradient(
      centerX,
      centerY,
      80,
      centerX,
      centerY,
      Math.max(totalW, totalH) * 0.6
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(startX, startY, totalW, totalH);

    this.ctx.restore();
  }
}
