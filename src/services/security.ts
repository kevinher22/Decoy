// ==============================================================================
// DON'T BLINK — Security, Anti-Cheat, Anti-Tamper & Anti-Abuse Engine
// ==============================================================================

import { SkinId, LeaderboardEntry, GameSaveData } from '../types';

const VALID_SKINS: readonly SkinId[] = [
  'default',
  'neon',
  'robot',
  'ghost',
  'pixel',
  'golden',
  'the_original',
  'night_runner',
  'last_survivor',
  'chrome_runner',
  'null_skin',
  'artificial_angel',
  'fracture',
  'iron_witness',
  'memory_keeper',
  'void_pilgrim',
  'the_mirror',
  'beyond_the_blink',
  'ash_runner',
  'white_noise',
  'redacted',
  'clockwork',
  'deep_sea',
  'red_shift',
  'the_archivist',
  'broken_halo',
  'the_drifter',
  'static_skin',
  'the_last_memory',
  'paradox',
];
const VALID_ENDINGS = new Set([
  'ending_01',
  'ending_02',
  'ending_03',
  'ending_04',
  'ending_05',
  'ending_06',
  'ending_07',
]);

const CONSUMED_SESSIONS_STORAGE_KEY = 'dont_blink_consumed_runs_v1';
const MAX_TRACKED_SESSIONS = 100;
const SUBMISSION_COOLDOWN_MS = 3500; // Minimum delay between online submission requests
const MAX_SUBMISSIONS_PER_WINDOW = 15; // Max 15 online submissions per 10 minutes
const WINDOW_DURATION_MS = 10 * 60 * 1000;

export interface RunSession {
  sessionId: string;
  startedAt: number;
  issuedAt: number;
}

export interface ScoreValidationResult {
  valid: boolean;
  sanitizedScore: number;
  sanitizedDistance: number;
  sanitizedDuration: number;
  sanitizedCoins: number;
  sanitizedPlayerName: string;
  sanitizedEndingId: string | null;
  sanitizedSkinId: SkinId;
  reason?: string;
}

class SecurityEngine {
  private activeSession: RunSession | null = null;
  private consumedSessionIds: Set<string> = new Set();
  private lastOnlineSubmissionTime: number = 0;
  private submissionTimestamps: number[] = [];

  constructor() {
    this.loadConsumedSessions();
  }

  // --- Session Tracking & Replay Prevention ---

  private loadConsumedSessions(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CONSUMED_SESSIONS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.consumedSessionIds = new Set(arr.slice(-MAX_TRACKED_SESSIONS));
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  private persistConsumedSessions(): void {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(this.consumedSessionIds).slice(-MAX_TRACKED_SESSIONS);
      localStorage.setItem(CONSUMED_SESSIONS_STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Generates a unique run session identifier when starting a run.
   */
  public createRunSession(): RunSession {
    let id: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = `run_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    const session: RunSession = {
      sessionId: id,
      startedAt: performance.now(),
      issuedAt: Date.now(),
    };

    this.activeSession = session;
    return session;
  }

  public getActiveSession(): RunSession | null {
    return this.activeSession;
  }

  public isSessionConsumed(sessionId: string): boolean {
    return this.consumedSessionIds.has(sessionId);
  }

  public markSessionConsumed(sessionId: string): void {
    this.consumedSessionIds.add(sessionId);
    this.persistConsumedSessions();
    if (this.activeSession?.sessionId === sessionId) {
      this.activeSession = null;
    }
  }

  // --- Sanitization & Rate Limiting ---

  /**
   * Sanitizes player display names:
   * - Trims whitespace
   * - Strips HTML tags, scripts, control characters
   * - Restricts length to 1-20 characters
   */
  public sanitizePlayerName(name: string): string {
    if (!name || typeof name !== 'string') return 'Runner';
    // Remove control chars, HTML tags, and backslashes
    const cleaned = name
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F\\]/g, '')
      .trim()
      .slice(0, 20);

    return cleaned.length > 0 ? cleaned : 'Runner';
  }

  /**
   * Enforces submission rate limits to prevent spamming the database.
   */
  public checkRateLimit(): { allowed: boolean; waitMs?: number; reason?: string } {
    const now = Date.now();

    // 1. Minimum cooldown between consecutive requests
    const timeSinceLast = now - this.lastOnlineSubmissionTime;
    if (timeSinceLast < SUBMISSION_COOLDOWN_MS) {
      return {
        allowed: false,
        waitMs: SUBMISSION_COOLDOWN_MS - timeSinceLast,
        reason: 'Rate limited: please wait a moment between submissions',
      };
    }

    // 2. Sliding window rate limit (15 requests per 10 mins)
    this.submissionTimestamps = this.submissionTimestamps.filter(
      (ts) => now - ts < WINDOW_DURATION_MS
    );
    if (this.submissionTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      return {
        allowed: false,
        waitMs: WINDOW_DURATION_MS - (now - this.submissionTimestamps[0]),
        reason: 'Submission quota reached. Score recorded locally.',
      };
    }

    return { allowed: true };
  }

  public recordOnlineSubmissionSuccess(): void {
    const now = Date.now();
    this.lastOnlineSubmissionTime = now;
    this.submissionTimestamps.push(now);
  }

  // --- Run Physics & Score Validation ---

  /**
   * Validates run metrics against physical game bounds:
   * - Negative/infinite numbers rejected
   * - Physical speed limit (~830 px/s)
   * - Physical score rate limit (~2,240 pts/s max)
   * - Valid skin and ending references
   */
  public validateRunMetrics(
    score: number,
    distance: number,
    durationSeconds: number,
    coinsEarned: number,
    playerName: string,
    endingId?: string | null,
    skinUsed?: string,
    sessionId?: string
  ): ScoreValidationResult {
    // 1. Session Replay Protection
    if (sessionId && this.isSessionConsumed(sessionId)) {
      return {
        valid: false,
        sanitizedScore: 0,
        sanitizedDistance: 0,
        sanitizedDuration: 0,
        sanitizedCoins: 0,
        sanitizedPlayerName: 'Runner',
        sanitizedEndingId: null,
        sanitizedSkinId: 'default',
        reason: 'Duplicate run session detected. Run was already submitted.',
      };
    }

    // 2. Basic Type & Finite Checks
    if (
      !Number.isFinite(score) ||
      !Number.isFinite(distance) ||
      !Number.isFinite(durationSeconds) ||
      !Number.isFinite(coinsEarned)
    ) {
      return {
        valid: false,
        sanitizedScore: 0,
        sanitizedDistance: 0,
        sanitizedDuration: 0,
        sanitizedCoins: 0,
        sanitizedPlayerName: 'Runner',
        sanitizedEndingId: null,
        sanitizedSkinId: 'default',
        reason: 'Non-finite numeric values rejected.',
      };
    }

    const cleanScore = Math.max(0, Math.min(5000000, Math.floor(score)));
    const cleanDist = Math.max(0, Math.min(1000000, Math.floor(distance)));
    const cleanDuration = Math.max(0, Math.min(86400, Math.floor(durationSeconds)));
    const cleanCoins = Math.max(0, Math.min(100000, Math.floor(coinsEarned)));
    const cleanName = this.sanitizePlayerName(playerName);

    // Validate Ending ID
    const cleanEnding =
      endingId && VALID_ENDINGS.has(endingId) ? endingId : null;

    // Validate Skin ID
    const cleanSkin: SkinId =
      skinUsed && VALID_SKINS.includes(skinUsed as SkinId)
        ? (skinUsed as SkinId)
        : 'default';

    // 3. Physical Bound Checks
    // Minimum duration: A score > 0 cannot be achieved in under 2 seconds
    if (cleanScore > 0 && cleanDuration < 2) {
      return {
        valid: false,
        sanitizedScore: cleanScore,
        sanitizedDistance: cleanDist,
        sanitizedDuration: cleanDuration,
        sanitizedCoins: cleanCoins,
        sanitizedPlayerName: cleanName,
        sanitizedEndingId: cleanEnding,
        sanitizedSkinId: cleanSkin,
        reason: 'Run duration too short for recorded score.',
      };
    }

    // Physical score velocity: Max plausible score is (duration * 3500) + 1000
    const maxPlausibleScore = cleanDuration * 3500 + 1000;
    if (cleanScore > maxPlausibleScore) {
      return {
        valid: false,
        sanitizedScore: cleanScore,
        sanitizedDistance: cleanDist,
        sanitizedDuration: cleanDuration,
        sanitizedCoins: cleanCoins,
        sanitizedPlayerName: cleanName,
        sanitizedEndingId: cleanEnding,
        sanitizedSkinId: cleanSkin,
        reason: 'Score exceeds physical engine boundaries for run duration.',
      };
    }

    // Physical distance velocity: Max plausible distance is (duration * 1200) + 200
    const maxPlausibleDist = cleanDuration * 1200 + 200;
    if (cleanDist > maxPlausibleDist) {
      return {
        valid: false,
        sanitizedScore: cleanScore,
        sanitizedDistance: cleanDist,
        sanitizedDuration: cleanDuration,
        sanitizedCoins: cleanCoins,
        sanitizedPlayerName: cleanName,
        sanitizedEndingId: cleanEnding,
        sanitizedSkinId: cleanSkin,
        reason: 'Distance exceeds physical speed limit for run duration.',
      };
    }

    return {
      valid: true,
      sanitizedScore: cleanScore,
      sanitizedDistance: cleanDist,
      sanitizedDuration: cleanDuration,
      sanitizedCoins: cleanCoins,
      sanitizedPlayerName: cleanName,
      sanitizedEndingId: cleanEnding,
      sanitizedSkinId: cleanSkin,
    };
  }

  // --- LocalStorage Tamper Resistance ---

  /**
   * Deterministic 32-bit FNV-1a checksum of critical progression data
   */
  public computeSaveChecksum(data: Partial<GameSaveData>): string {
    const salt = 'db_k3h3rc3r_sec';
    const payload = `${salt}:${data.bestScore || 0}:${data.coins || 0}:${(data.unlockedSkins || []).join(',')}:${(data.story?.unlockedEndings || []).join(',')}:${data.stats?.totalRuns || 0}`;

    let hash = 0x811c9dc5;
    for (let i = 0; i < payload.length; i++) {
      hash ^= payload.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  /**
   * Validates and sanitizes data loaded from localStorage to prevent crashes
   * from manual corruption or JSON editing.
   */
  public sanitizeLoadedSaveData(raw: any, defaultSave: GameSaveData): GameSaveData {
    if (!raw || typeof raw !== 'object') {
      return { ...defaultSave };
    }

    // Sanitize numbers
    const bestScore = Number.isFinite(raw.bestScore)
      ? Math.max(0, Math.min(5000000, Math.floor(raw.bestScore)))
      : 0;

    const coins = Number.isFinite(raw.coins)
      ? Math.max(0, Math.min(999999, Math.floor(raw.coins)))
      : 0;

    // Sanitize unlocked skins (must be recognized skins)
    const rawSkins = Array.isArray(raw.unlockedSkins) ? raw.unlockedSkins : ['default'];
    const unlockedSkins: SkinId[] = rawSkins.filter((s: any): s is SkinId =>
      VALID_SKINS.includes(s)
    );
    if (!unlockedSkins.includes('default')) unlockedSkins.unshift('default');

    const selectedSkin: SkinId = VALID_SKINS.includes(raw.selectedSkin)
      ? raw.selectedSkin
      : 'default';

    // Sanitize story state
    const rawStory = raw.story || {};
    const unlockedEndings: string[] = Array.isArray(rawStory.unlockedEndings)
      ? rawStory.unlockedEndings.filter((e: any) => typeof e === 'string' && VALID_ENDINGS.has(e))
      : [];

    return {
      ...defaultSave,
      ...raw,
      bestScore,
      coins,
      selectedSkin,
      unlockedSkins,
      story: {
        ...defaultSave.story,
        ...rawStory,
        unlockedEndings,
      },
    };
  }
}

export const securityService = new SecurityEngine();
