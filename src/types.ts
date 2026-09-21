export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'CUSTOMIZE'
  | 'ACHIEVEMENTS'
  | 'DAILY_CHALLENGE'
  | 'SETTINGS'
  | 'LEADERBOARD'
  | 'OPENING_CUTSCENE'
  | 'STORY_MENU'
  | 'ENDINGS_MENU'
  | 'ENDING_CINEMATIC'
  | 'CREDITS';

export type SkinId =
  | 'default'
  | 'neon'
  | 'robot'
  | 'ghost'
  | 'pixel'
  | 'golden'
  | 'the_original'
  | 'night_runner'
  | 'last_survivor'
  | 'chrome_runner'
  | 'null_skin'
  | 'artificial_angel'
  | 'fracture'
  | 'iron_witness'
  | 'memory_keeper'
  | 'void_pilgrim'
  | 'the_mirror'
  | 'beyond_the_blink'
  | 'ash_runner'
  | 'white_noise'
  | 'redacted'
  | 'clockwork'
  | 'deep_sea'
  | 'red_shift'
  | 'the_archivist'
  | 'broken_halo'
  | 'the_drifter'
  | 'static_skin'
  | 'the_last_memory'
  | 'paradox'
  | 'rust_nomad'
  | 'cyber_courier'
  | 'void_diver'
  | 'glitch_weaver'
  | 'aegis_vanguard'
  | 'solar_nomad'
  | 'chrono_detective'
  | 'phantom_ronin'
  | 'neon_aristocrat'
  | 'astral_sovereign';

export type EntitySkinId =
  | 'entity_original'
  | 'entity_machine'
  | 'entity_artificial_angel'
  | 'entity_fractured'
  | 'entity_hollow'
  | 'entity_watcher'
  | 'entity_old_one'
  | 'entity_origin'
  | 'entity_ashen'
  | 'entity_white_signal'
  | 'entity_archive'
  | 'entity_red_shift'
  | 'entity_drowned'
  | 'entity_clock'
  | 'entity_redacted'
  | 'entity_paradox'
  | 'entity_cryo_phantom'
  | 'entity_neon_parasite'
  | 'entity_chitin_colossus'
  | 'entity_prismatic_shard'
  | 'entity_iron_bell'
  | 'entity_ocular_swarm'
  | 'entity_wire_weaver'
  | 'entity_solar_seraph';

export type OrbCosmeticId =
  | 'orb_default'
  | 'orb_heart_of_null'
  | 'orb_broken_clock'
  | 'orb_white_signal'
  | 'orb_red_shift_core'
  | 'orb_angelic_failure'
  | 'orb_memory_glass'
  | 'orb_static_heart'
  | 'orb_paradox_seed';

export interface PurchaseRecord {
  transaction_id: string;
  product_id: string;
  player_id: string;
  platform: string;
  purchased_at: number;
  verification_status: 'verified' | 'pending' | 'mock_verified';
  priceDisplay?: string;
}

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  cost: number;
  unlockedByDefault?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    trail: string;
  };
}

export type CollectibleType = 'NORMAL' | 'RARE' | 'PERFECT' | 'MEMORY_SHARD' | 'CORRUPTED_ANOMALY';

export interface Collectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CollectibleType;
  value: number;
  coinReward: number;
  collected: boolean;
  bobOffset: number;
  rotation: number;
}

export type ObstacleType = 'BARRIER_LOW' | 'BARRIER_TALL' | 'LASER_HIGH' | 'ENERGY_GATE' | 'PULSE_MINE' | 'SHADOW_HAND';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
  nearMissAwarded: boolean;
  state: number; // for animations
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'spark' | 'square';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  alpha: number;
  vy: number;
}

export interface DailyChallenge {
  id: string; // e.g. '2026-09-17'
  title: string;
  description: string;
  targetType: 'score' | 'time' | 'combo' | 'coins' | 'no_hit';
  targetValue: number;
  progress: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface PlayerIdentity {
  playerId: string;
  displayName: string;
  isAuthenticated: boolean;
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  combo: number;
  durationSeconds: number;
  coinsEarned: number;
  timestamp: number;
  skinUsed: SkinId;
  player_id?: string;
  playerName?: string;
  display_name?: string;
  distance?: number;
  endingId?: string | null;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number; // 0 - 100
  sfxVolume: number; // 0 - 100
  musicVolume: number; // 0 - 100
  reducedMotion: boolean;
  screenShake: boolean;
  particles: boolean;
  vibration: boolean;
  language: 'id' | 'en';
}

export interface PlayerStats {
  totalRuns: number;
  totalScore: number;
  totalCoinsCollected: number;
  totalPlayTimeSeconds: number;
  highestCombo: number;
  obstaclesDodged: number;
  totalDistance: number;
  successfulRuns: number;
  failedRuns: number;
  lookBackCount: number;
}

// --- STORY & MYSTERY SYSTEM TYPES ---

export type FragmentCategory = 'MEMORY' | 'ENTITY' | 'LOCATION' | 'CHARACTER' | 'WARNING' | 'TRUTH';

export interface StoryFragment {
  id: string;
  number: number;
  category: FragmentCategory;
  title: { id: string; en: string };
  excerpt: { id: string; en: string };
  content: { id: string; en: string };
}

export interface StoryChapter {
  id: string;
  number: number;
  title: { id: string; en: string };
  teaser: { id: string; en: string };
  synopsis: { id: string; en: string };
  content?: { id: string; en: string };
  unlockRequirementText: { id: string; en: string };
}

export type EndingId =
  | 'ending_01'
  | 'ending_02'
  | 'ending_03'
  | 'ending_04'
  | 'ending_05'
  | 'ending_06'
  | 'ending_07';

export interface GameEnding {
  id: EndingId;
  number: string; // '01', '02', ..., '07'
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  shortDescription: { id: string; en: string };
  description?: { id: string; en: string };
  teaserHint: { id: string; en: string };
  hint?: { id: string; en: string };
  narrativeLines: { id: string; en: string }[];
  sceneType: 'escape' | 'truth' | 'blinked' | 'thing' | 'memory' | 'false_escape' | 'dont_blink';
}

export interface StoryState {
  courage: number; // 0 - 100 (Internal)
  fear: number; // 0 - 100 (Internal)
  memory: number; // 0 - 100 (Internal)
  trust: number; // 0 - 100 (Internal)
  corruption: number; // 0 - 100 (Internal)
  awareness: number; // 0 - 100 (Internal)
  lookBackCount: number;
  secretEventsDiscovered: string[];
  unlockedFragments: string[];
  unlockedChapters: string[];
  unlockedEndings: EndingId[];
  hasSeenIntro: boolean;
  hasSeenOpeningCutscene?: boolean;
  finalStoryCutsceneSeen?: boolean;
}

export interface GameSaveData {
  version: number;
  bestScore: number;
  coins: number;
  selectedSkin: SkinId;
  unlockedSkins: SkinId[];
  selectedEntitySkin?: EntitySkinId;
  unlockedEntitySkins?: EntitySkinId[];
  selectedOrbCosmetic?: OrbCosmeticId;
  unlockedOrbCosmetics?: OrbCosmeticId[];
  purchasedBundles?: string[];
  fullStoryUnlocked?: boolean;
  supporterPackUnlocked?: boolean;
  purchaseHistory?: PurchaseRecord[];
  achievements: Record<string, { unlocked: boolean; unlockedAt?: number }>;
  dailyChallenge: {
    dateKey: string;
    progress: number;
    completed: boolean;
    claimed: boolean;
  };
  settings: UserSettings;
  stats: PlayerStats;
  history: LeaderboardEntry[];
  tutorialCompleted: boolean;
  adsRemoved: boolean;
  story: StoryState;
}
