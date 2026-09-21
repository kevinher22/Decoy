export type Language = 'id' | 'en';

export interface Translations {
  // Navigation & General
  playNow: string;
  spaceKey: string;
  bestScore: string;
  finalScore: string;
  maxCombo: string;
  orbs: string;
  distance: string;
  playAgain: string;
  shareScore: string;
  copiedToClipboard: string;
  menu: string;
  back: string;
  close: string;
  skip: string;
  continue: string;
  unlocked: string;
  locked: string;
  unknown: string;
  view: string;
  replay: string;
  discovered: string;

  // Modals & Menus
  story: string;
  chapters: string;
  fragments: string;
  endings: string;
  achievements: string;
  skins: string;
  daily: string;
  records: string;
  settings: string;
  credits: string;

  // Gameplay HUD & Prompts
  nearMiss: string;
  lookBack: string;
  dontLookBack: string;
  danger: string;
  anomalyDetected: string;
  lookBackPrompt: string;

  // Game Over
  gameOver: string;
  runComplete: string;
  newRecord: string;
  newStoryDiscovery: string;
  endingUnlocked: string;
  watchAdContinue: string;
  adPlaceholder: string;

  // Audio & Settings
  audioPreferences: string;
  soundEffects: string;
  sfxDesc: string;
  music: string;
  musicDesc: string;
  masterVolume: string;
  sfxVolume: string;
  musicVolume: string;
  accessibility: string;
  reducedMotion: string;
  reducedMotionDesc: string;
  screenShake: string;
  screenShakeDesc: string;
  particles: string;
  particlesDesc: string;
  vibration: string;
  language: string;
  replayIntroCutscene: string;
  resetLocalProgress: string;
  resetConfirmText: string;
  yesResetAll: string;
  cancel: string;

  // Credits
  createdBy: string;
  gameDesign: string;
  development: string;
  audioVisual: string;

  // Intro Cutscene
  introTime: string;
  introLine1: string;
  introLine2: string;
  introLine3: string;
  introTitle: string;
  finalCutsceneTitle: string;
  finalCutsceneSubtitle: string;
  replayFinalCutscene: string;

  // Additional UI & Gameplay Keys
  storyJournal: string;
  score: string;
  combo: string;
  tagline: string;
  badges: string;
  gamePaused: string;
  resume: string;
  restart: string;
  soundFX: string;
  soundFXDesc: string;
  howToPlay: string;
  controlsJump: string;
  controlsLookBack: string;
  controlsPause: string;
  controlsRestart: string;
  removeAds: string;
  resetProgress: string;
}

const translations: Record<Language, Translations> = {
  id: {
    playNow: 'MAIN SEKARANG',
    spaceKey: 'SPASI',
    bestScore: 'SKOR TERBAIK',
    finalScore: 'SKOR AKHIR',
    maxCombo: 'KOMBO MAKS',
    orbs: 'ORB CAHAYA',
    distance: 'JARAK',
    playAgain: 'MAIN LAGI',
    shareScore: 'BAGIKAN SKOR',
    copiedToClipboard: 'TERSALIN KE PAPAN KLIP!',
    menu: 'MENU UTAMA',
    back: 'KEMBALI',
    close: 'TUTUP',
    skip: 'LEWATI',
    continue: 'LANJUTKAN',
    unlocked: 'TERBUKA',
    locked: 'TERKUNCI',
    unknown: '???????????',
    view: 'LIHAT',
    replay: 'PUTAR ULANG',
    discovered: 'DITEMUKAN',

    story: 'MISTERI & CERITA',
    chapters: 'CHAPTER',
    fragments: 'FRAGMEN INGATAN',
    endings: 'KOLEKSI ENDING',
    achievements: 'PENCAPAIAN',
    skins: 'SKIN KARAKTER',
    daily: 'TANTANGAN HARIAN',
    records: 'REKOR TERBAIK',
    settings: 'PENGATURAN',
    credits: 'KREDIT',

    nearMiss: 'LEWAT TIPIS!',
    lookBack: 'MENOLEH KE BELAKANG',
    dontLookBack: 'JANGAN MENOLEH!',
    danger: 'BAHAYA MENDEKAT',
    anomalyDetected: 'ANOMALI TERDETEKSI!',
    lookBackPrompt: 'TEKAN [B] ATAU TAP UNTUK MENOLEH',

    gameOver: 'PERMAINAN USAI',
    runComplete: 'PELARIAN BERAKHIR',
    newRecord: 'REKOR BARU!',
    newStoryDiscovery: 'FRAGMEN CERITA BARU DITEMUKAN!',
    endingUnlocked: 'ENDING BARU TERBUKA!',
    watchAdContinue: 'Tonton Iklan Untuk Melanjutkan',
    adPlaceholder: 'Ruang Iklan Sponsor (Siap Integrasi AdMob / WebAds)',

    audioPreferences: 'PENGATURAN SUARA',
    soundEffects: 'Efek Suara (SFX)',
    sfxDesc: 'Lompatan, orb energi, dan suara anomali',
    music: 'Musik Atmosferik Synth',
    musicDesc: 'Musik prosedural misterius dan dinamis',
    masterVolume: 'Volume Master',
    sfxVolume: 'Volume Efek Suara (SFX)',
    musicVolume: 'Volume Musik',
    accessibility: 'AKSESIBILITAS & VISUAL',
    reducedMotion: 'Kurangi Gerakan',
    reducedMotionDesc: 'Matikan guncangan layar & partikel berlebih',
    screenShake: 'Guncangan Layar (Screen Shake)',
    screenShakeDesc: 'Getaran visual saat benturan dan bahaya',
    particles: 'Efek Partikel',
    particlesDesc: 'Jejak cahaya, serpihan, dan debu kinetik',
    vibration: 'Getaran HP (Haptic Vibration)',
    language: 'Bahasa (Language)',
    replayIntroCutscene: 'Tonton Ulang Prolog Cutscene',
    resetLocalProgress: 'RESET PROGRES LOKAL',
    resetConfirmText: 'Hapus skor, koin, fragmen, dan ending secara permanen?',
    yesResetAll: 'YA, RESET SEMUA',
    cancel: 'BATAL',

    createdBy: 'Dibuat Oleh:',
    gameDesign: 'Desain Permainan:',
    development: 'Pengembangan:',
    audioVisual: 'Sistem Audio & Visual:',

    introTime: '02:17 AM',
    introLine1: 'Aku seharusnya tidak berada di sini...',
    introLine2: 'Kalau kau mendengarnya di belakangmu...',
    introLine3: '...jangan menoleh.',
    introTitle: "DON'T BLINK",
    finalCutsceneTitle: 'CUTSCENE AKHIR KISAH',
    finalCutsceneSubtitle: 'Konvergensi Seluruh Akhir Kisah',
    replayFinalCutscene: 'Putar Ulang Cutscene Akhir',

    storyJournal: 'JURNAL KISAH',
    score: 'SKOR',
    combo: 'KOMBO',
    tagline: 'BERAPA LAMA KAU BISA BERTAHAN?',
    badges: 'LENCANA',
    gamePaused: 'PERMAINAN DIJEDA',
    resume: 'LANJUTKAN',
    restart: 'ULANGI PERMAINAN',
    soundFX: 'Efek Suara (SFX)',
    soundFXDesc: 'Lompatan, orb energi, dan petunjuk anomali',
    howToPlay: 'CARA BERMAIN & KONTROL',
    controlsJump: 'Lompat / Hindari Rintangan',
    controlsLookBack: 'Menoleh ke Belakang (Saat Tersedia)',
    controlsPause: 'Pause / Jeda Permainan',
    controlsRestart: 'Ulangi Permainan Cepat',
    removeAds: 'HAPUS IKLAN',
    resetProgress: 'Reset Seluruh Data Lokal',
  },
  en: {
    playNow: 'PLAY NOW',
    spaceKey: 'SPACE',
    bestScore: 'BEST SCORE',
    finalScore: 'FINAL SCORE',
    maxCombo: 'MAX COMBO',
    orbs: 'ENERGY ORBS',
    distance: 'DISTANCE',
    playAgain: 'PLAY AGAIN',
    shareScore: 'SHARE SCORE',
    copiedToClipboard: 'COPIED TO CLIPBOARD!',
    menu: 'MAIN MENU',
    back: 'BACK',
    close: 'CLOSE',
    skip: 'SKIP',
    continue: 'CONTINUE',
    unlocked: 'UNLOCKED',
    locked: 'LOCKED',
    unknown: '???????????',
    view: 'VIEW',
    replay: 'REPLAY',
    discovered: 'DISCOVERED',

    story: 'STORY & MYSTERY',
    chapters: 'CHAPTERS',
    fragments: 'MEMORY FRAGMENTS',
    endings: 'ENDING COLLECTION',
    achievements: 'BADGES',
    skins: 'SKINS',
    daily: 'DAILY MISSIONS',
    records: 'RECORDS',
    settings: 'SETTINGS',
    credits: 'CREDITS',

    nearMiss: 'NEAR MISS!',
    lookBack: 'LOOK BACK',
    dontLookBack: "DON'T TURN AROUND!",
    danger: 'DANGER APPROACHING',
    anomalyDetected: 'ANOMALY DETECTED!',
    lookBackPrompt: 'PRESS [B] OR TAP TO LOOK BACK',

    gameOver: 'GAME OVER',
    runComplete: 'RUN COMPLETE',
    newRecord: 'NEW RECORD!',
    newStoryDiscovery: 'NEW STORY FRAGMENT DISCOVERED!',
    endingUnlocked: 'NEW ENDING UNLOCKED!',
    watchAdContinue: 'Watch an Ad to Continue',
    adPlaceholder: 'Sponsor Ad Slot (AdMob / WebAds Ready)',

    audioPreferences: 'AUDIO PREFERENCES',
    soundEffects: 'Sound Effects (SFX)',
    sfxDesc: 'Jumps, energy orbs, and mystery cues',
    music: 'Atmospheric Synth Music',
    musicDesc: 'Dynamic procedural tension soundtrack',
    masterVolume: 'Master Volume',
    sfxVolume: 'SFX Volume',
    musicVolume: 'Music Volume',
    accessibility: 'ACCESSIBILITY & VISUALS',
    reducedMotion: 'Reduced Motion',
    reducedMotionDesc: 'Disable heavy screen shake and intense effects',
    screenShake: 'Screen Shake',
    screenShakeDesc: 'Impact & danger camera vibrations',
    particles: 'Particle Effects',
    particlesDesc: 'Speed trails, sparks, and kinetic dust',
    vibration: 'Haptic Vibration',
    language: 'Language',
    replayIntroCutscene: 'Replay Prologue Cutscene',
    resetLocalProgress: 'RESET LOCAL PROGRESS',
    resetConfirmText: 'Permanently erase high score, orbs, fragments, and endings?',
    yesResetAll: 'YES, RESET ALL',
    cancel: 'CANCEL',

    createdBy: 'Created by:',
    gameDesign: 'Game Design:',
    development: 'Development:',
    audioVisual: 'Audio & Visual Systems:',

    introTime: '02:17 AM',
    introLine1: "I shouldn't be here...",
    introLine2: 'If you hear it behind you...',
    introLine3: "...don't turn around.",
    introTitle: "DON'T BLINK",
    finalCutsceneTitle: 'FINAL STORY CUTSCENE',
    finalCutsceneSubtitle: 'The Convergence of All Endings',
    replayFinalCutscene: 'Replay Final Cutscene',

    storyJournal: 'STORY JOURNAL',
    score: 'SCORE',
    combo: 'COMBO',
    tagline: 'HOW LONG CAN YOU LAST?',
    badges: 'BADGES',
    gamePaused: 'GAME PAUSED',
    resume: 'RESUME',
    restart: 'RESTART',
    soundFX: 'Sound Effects (SFX)',
    soundFXDesc: 'Jumps, energy orbs, and mystery cues',
    howToPlay: 'HOW TO PLAY & CONTROLS',
    controlsJump: 'Jump / Avoid Obstacles',
    controlsLookBack: 'Look Back (When Available)',
    controlsPause: 'Pause Game',
    controlsRestart: 'Quick Restart',
    removeAds: 'REMOVE ADS',
    resetProgress: 'Reset All Local Data',
  },
};

export function t(key: keyof Translations, lang: Language = 'id'): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? String(key);
}

export function getTranslations(lang: Language = 'id'): Translations {
  return translations[lang] || translations.id;
}

function getInitialLanguage(): Language {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('dont_blink_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.settings?.language === 'en' || parsed?.settings?.language === 'id') {
          return parsed.settings.language;
        }
      }
    } catch {
      // Fallback to default
    }
  }
  // NEW USER: Indonesian immediately on first render!
  return 'id';
}

let currentLang: Language = getInitialLanguage();

type LanguageChangeListener = (lang: Language) => void;
const listeners: Set<LanguageChangeListener> = new Set();

export const i18n = {
  getLanguage(): Language {
    return currentLang;
  },
  setLanguage(lang: Language): void {
    if (lang !== 'id' && lang !== 'en') return;
    currentLang = lang;
    listeners.forEach((fn) => {
      try {
        fn(lang);
      } catch (err) {
        console.error('Error in language listener', err);
      }
    });
  },
  subscribe(fn: LanguageChangeListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  t(key: keyof Translations, lang?: Language): string {
    return t(key, lang || currentLang);
  },
  getTranslations(lang?: Language): Translations {
    return getTranslations(lang || currentLang);
  },
};

