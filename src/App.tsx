import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, SkinId, EntitySkinId, OrbCosmeticId, UserSettings, DailyChallenge, GameEnding } from './types';
import { GameEngine } from './game/engine';
import { storage } from './services/storage';
import { sound } from './services/audio';
import { analytics } from './services/analytics';
import { leaderboardService } from './services/leaderboard';
import { INITIAL_ACHIEVEMENTS } from './game/constants';
import { GAME_ENDINGS } from './data/storyData';
import { i18n } from './services/i18n';

import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { CustomizeModal } from './components/CustomizeModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { AchievementToast } from './components/AchievementToast';
import { OpeningCutscene } from './components/OpeningCutscene';
import { StoryJournalModal } from './components/StoryJournalModal';
import { EndingsModal } from './components/EndingsModal';
import { EndingCutsceneModal } from './components/EndingCutsceneModal';
import { CreditsModal } from './components/CreditsModal';
import { FinalStoryCutsceneModal } from './components/FinalStoryCutsceneModal';

export default function App() {
  // State Machine
  const [gameState, setGameState] = useState<GameState>(() => {
    return storage.hasSeenOpeningCutscene() ? 'MENU' : 'OPENING_CUTSCENE';
  });

  // Game Engine Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent User Data State
  const [bestScore, setBestScore] = useState<number>(() => storage.getData().bestScore);
  const [totalCoins, setTotalCoins] = useState<number>(() => storage.getData().coins);
  const [selectedSkin, setSelectedSkin] = useState<SkinId>(() => storage.getData().selectedSkin);
  const [unlockedSkins, setUnlockedSkins] = useState<SkinId[]>(() => storage.getData().unlockedSkins);
  const [selectedEntitySkin, setSelectedEntitySkin] = useState<EntitySkinId>(() => storage.getData().selectedEntitySkin || 'entity_original');
  const [unlockedEntitySkins, setUnlockedEntitySkins] = useState<EntitySkinId[]>(() => storage.getData().unlockedEntitySkins || ['entity_original']);
  const [selectedOrbCosmetic, setSelectedOrbCosmetic] = useState<OrbCosmeticId>(() => storage.getData().selectedOrbCosmetic || 'orb_default');
  const [unlockedOrbCosmetics, setUnlockedOrbCosmetics] = useState<OrbCosmeticId[]>(() => storage.getData().unlockedOrbCosmetics || ['orb_default']);
  const [purchasedBundles, setPurchasedBundles] = useState<string[]>(() => storage.getData().purchasedBundles || []);
  const [adsRemoved, setAdsRemoved] = useState<boolean>(() => !!storage.getData().adsRemoved);
  const [fullStoryUnlocked, setFullStoryUnlocked] = useState<boolean>(() => !!storage.getData().fullStoryUnlocked);
  const [supporterPackUnlocked, setSupporterPackUnlocked] = useState<boolean>(() => !!storage.getData().supporterPackUnlocked);
  const [hasRevivedThisRun, setHasRevivedThisRun] = useState<boolean>(false);
  const [settings, setSettings] = useState<UserSettings>(() => storage.getData().settings);
  const [achievementsMap, setAchievementsMap] = useState<
    Record<string, { unlocked: boolean; unlockedAt?: number }>
  >({});

  // Active Run HUD State
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [isLookBackAvailable, setIsLookBackAvailable] = useState<boolean>(false);
  const [coinsEarnedRun, setCoinsEarnedRun] = useState<number>(0);
  const [showTutorialHint, setShowTutorialHint] = useState<boolean>(false);

  // Responsive Device Orientation State (Automatically adapts Android Portrait vs Landscape vs Desktop)
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  // Story & Endings Modal States
  const [isStoryJournalOpen, setIsStoryJournalOpen] = useState<boolean>(false);
  const [isEndingsModalOpen, setIsEndingsModalOpen] = useState<boolean>(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [isFinalCutsceneOpen, setIsFinalCutsceneOpen] = useState<boolean>(false);
  const [selectedEndingForCutscene, setSelectedEndingForCutscene] =
    useState<GameEnding | null>(null);

  const handleCloseEndingCutscene = useCallback(() => {
    setSelectedEndingForCutscene(null);
    const story = storage.getStoryState();
    if (story.unlockedEndings.length >= 7 && !storage.hasSeenFinalStoryCutscene()) {
      setIsFinalCutsceneOpen(true);
    }
  }, []);

  // Game Over Results
  const [finalRunResult, setFinalRunResult] = useState<{
    score: number;
    bestScore: number;
    combo: number;
    coins: number;
    distance: number;
    isNewRecord: boolean;
    newEndingId?: string | null;
    newFragments?: string[];
  }>({
    score: 0,
    bestScore: 0,
    combo: 0,
    coins: 0,
    distance: 0,
    isNewRecord: false,
  });

  // Daily Challenge State
  const todayKey = new Date().toISOString().split('T')[0];
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(() =>
    storage.getDailyChallenge(todayKey)
  );

  // Toast Notification
  const [activeToast, setActiveToast] = useState<{ title: string; description: string } | null>(
    null
  );

  // Load Initial Persistent Data
  useEffect(() => {
    const data = storage.getData();
    setBestScore(data.bestScore);
    setTotalCoins(data.coins);
    setSelectedSkin(data.selectedSkin);
    setUnlockedSkins(data.unlockedSkins);
    setSelectedEntitySkin(data.selectedEntitySkin || 'entity_original');
    setUnlockedEntitySkins(data.unlockedEntitySkins || ['entity_original']);
    setSelectedOrbCosmetic(data.selectedOrbCosmetic || 'orb_default');
    setUnlockedOrbCosmetics(data.unlockedOrbCosmetics || ['orb_default']);
    setPurchasedBundles(data.purchasedBundles || []);
    setAdsRemoved(!!data.adsRemoved);
    setFullStoryUnlocked(!!data.fullStoryUnlocked);
    setSupporterPackUnlocked(!!data.supporterPackUnlocked);
    setSettings(data.settings);
    setAchievementsMap(data.achievements);
    setDailyChallenge(storage.getDailyChallenge(todayKey));

    if (data.settings.language) {
      i18n.setLanguage(data.settings.language);
    }
  }, [todayKey]);

  // Language subscription for immediate UI reactivity
  const [, setLangVersion] = useState<number>(0);
  useEffect(() => {
    return i18n.subscribe(() => {
      setLangVersion((v) => v + 1);
    });
  }, []);

  // Automatic Trigger for Final Story Cutscene when all 7 endings are unlocked
  useEffect(() => {
    if (gameState === 'MENU' && !isFinalCutsceneOpen && !selectedEndingForCutscene) {
      const storyState = storage.getStoryState();
      if (storyState.unlockedEndings.length >= 7 && !storage.hasSeenFinalStoryCutscene()) {
        setIsFinalCutsceneOpen(true);
      }
    }
  }, [gameState, isFinalCutsceneOpen, selectedEndingForCutscene]);

  // Check & Unlock Achievement helper
  const unlockAchievement = useCallback((id: string) => {
    const unlocked = storage.unlockAchievement(id);
    if (unlocked) {
      sound.playAchievement();
      const meta = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
      if (meta) {
        setActiveToast({ title: meta.title, description: meta.description });
      }
      setAchievementsMap({ ...storage.getData().achievements });
      analytics.logEvent('achievement_unlocked', { achievement_id: id });
    }
  }, []);

  // Update Daily Challenge progress helper
  const updateDailyProgress = useCallback(
    (val: number) => {
      const { completedNow } = storage.updateDailyProgress(todayKey, val);
      const updated = storage.getDailyChallenge(todayKey);
      setDailyChallenge(updated);

      if (completedNow) {
        sound.playAchievement();
        setActiveToast({
          title: 'Daily Challenge Complete!',
          description: `Mission finished: ${updated.title}`,
        });
        analytics.logEvent('daily_challenge_completed');
      }
    },
    [todayKey]
  );

  // Keep gameState in ref for callbacks/resize
  const gameStateRef = useRef<GameState>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Keep game callbacks in ref to avoid engine teardown on state/prop changes
  const callbacksRef = useRef({
    onScoreUpdate: (score: number, combo: number, multiplier: number, distance?: number) => {
      setCurrentScore(score);
      setCurrentCombo(combo);
      setCurrentMultiplier(multiplier);
      if (distance !== undefined) {
        setCurrentDistance(distance);
      }
    },
    onCoinCollected: (_coinsTotal: number, earned: number) => {
      setCoinsEarnedRun((prev) => prev + earned);
      storage.addCoins(earned);
      setTotalCoins(storage.getData().coins);

      const totalEarnedSoFar = storage.getData().stats.totalCoinsCollected;
      if (totalEarnedSoFar >= 50) {
        unlockAchievement('coin_collector');
      }
    },
    onNewRecord: (_score: number) => {
      unlockAchievement('record_breaker');
    },
    onAchievementProgress: (event: string, value: number) => {
      if (event === 'game_started') {
        unlockAchievement('first_run');
      } else if (event === 'current_score') {
        if (value >= 100) unlockAchievement('century');
        if (value >= 1000) unlockAchievement('high_roller');
        if (dailyChallenge.targetType === 'score') {
          updateDailyProgress(value);
        }
      } else if (event === 'survival_time') {
        if (value >= 30) unlockAchievement('speedrunner');
        if (dailyChallenge.targetType === 'time') {
          updateDailyProgress(Math.floor(value));
        }
      } else if (event === 'max_combo') {
        if (value >= 6) unlockAchievement('combo_master');
        if (dailyChallenge.targetType === 'combo') {
          updateDailyProgress(value);
        }
      } else if (event === 'coins_collected') {
        if (dailyChallenge.targetType === 'coins') {
          updateDailyProgress(value);
        }
      } else if (event === 'obstacles_dodged') {
        if (value >= 5) {
          unlockAchievement('no_hit');
        }
      }
    },
    onLookBackAvailabilityChange: (available: boolean) => {
      setIsLookBackAvailable(available);
    },
    onNewStoryDiscovery: (title: string, subtitle?: string) => {
      sound.playFragmentFound();
      setActiveToast({
        title: title,
        description: subtitle || 'Dokumen koridor ditambahkan ke Jurnal Kisah.',
      });
    },
    onEndingTriggered: (endingId: string) => {
      const ending = GAME_ENDINGS.find((e) => e.id === endingId);
      if (ending) {
        setSelectedEndingForCutscene(ending);
      }
    },
    onGameOver: (
      score: number,
      maxCombo: number,
      coinsEarned: number,
      durationSec: number,
      distance: number,
      newEndingId: string | null,
      newFragments: string[],
      runSessionId?: string
    ) => {
      const prevBest = storage.getData().bestScore;
      const isNewRecord = storage.updateBestScore(score);
      const newBest = storage.getData().bestScore;

      // Submit to Leaderboard Architecture (online Supabase + offline cache)
      leaderboardService.submitScore(
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          score,
          combo: maxCombo,
          durationSeconds: durationSec,
          coinsEarned,
          timestamp: Date.now(),
          skinUsed: selectedSkin,
        },
        distance,
        newEndingId,
        undefined,
        runSessionId
      );

      analytics.logEvent('game_over', {
        score,
        combo: maxCombo,
        coins: coinsEarned,
        distance,
      });

      // Check distance achievements
      if (distance >= 500) {
        unlockAchievement('marathon_runner');
      }

      // Check total fragments achievement
      const storyState = storage.getStoryState();
      if (storyState.unlockedFragments.length >= 10) {
        unlockAchievement('fragment_collector');
      }
      if (storyState.unlockedEndings.length >= 7) {
        unlockAchievement('endings_master');
      }

      setBestScore(newBest);
      setFinalRunResult({
        score,
        bestScore: newBest,
        combo: maxCombo,
        coins: coinsEarned,
        distance,
        isNewRecord: isNewRecord && prevBest > 0,
        newEndingId,
        newFragments,
      });

      // If a new ending was unlocked, trigger cutscene right away!
      if (newEndingId) {
        const found = GAME_ENDINGS.find((e) => e.id === newEndingId);
        if (found) {
          setSelectedEndingForCutscene(found);
        }
      }

      setGameState('GAME_OVER');
    },
  });

  // Keep callbacks ref updated with current closure values
  useEffect(() => {
    callbacksRef.current.onAchievementProgress = (event: string, value: number) => {
      if (event === 'game_started') {
        unlockAchievement('first_run');
      } else if (event === 'current_score') {
        if (value >= 100) unlockAchievement('century');
        if (value >= 1000) unlockAchievement('high_roller');
        if (dailyChallenge.targetType === 'score') {
          updateDailyProgress(value);
        }
      } else if (event === 'survival_time') {
        if (value >= 30) unlockAchievement('speedrunner');
        if (dailyChallenge.targetType === 'time') {
          updateDailyProgress(Math.floor(value));
        }
      } else if (event === 'max_combo') {
        if (value >= 6) unlockAchievement('combo_master');
        if (dailyChallenge.targetType === 'combo') {
          updateDailyProgress(value);
        }
      } else if (event === 'coins_collected') {
        if (dailyChallenge.targetType === 'coins') {
          updateDailyProgress(value);
        }
      } else if (event === 'obstacles_dodged') {
        if (value >= 5) {
          unlockAchievement('no_hit');
        }
      }
    };
  }, [dailyChallenge, unlockAchievement, updateDailyProgress]);

  // Initialize Game Engine ONCE on canvas mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (...args) => callbacksRef.current.onScoreUpdate(...args),
      onCoinCollected: (...args) => callbacksRef.current.onCoinCollected(...args),
      onNewRecord: (...args) => callbacksRef.current.onNewRecord(...args),
      onAchievementProgress: (...args) => callbacksRef.current.onAchievementProgress(...args),
      onGameOver: (...args) => callbacksRef.current.onGameOver(...args),
      onLookBackAvailabilityChange: (...args) =>
        callbacksRef.current.onLookBackAvailabilityChange?.(...args),
      onNewStoryDiscovery: (...args) =>
        callbacksRef.current.onNewStoryDiscovery?.(...args),
      onEndingTriggered: (...args) =>
        callbacksRef.current.onEndingTriggered?.(...args),
    });

    engine.setPersonalBest(storage.getData().bestScore);
    engine.setSkin(storage.getData().selectedSkin);
    engine.setEntitySkin(storage.getData().selectedEntitySkin || 'entity_original');
    engine.setOrbCosmetic(storage.getData().selectedOrbCosmetic || 'orb_default');
    engine.setReducedMotion(storage.getData().settings.reducedMotion);
    engineRef.current = engine;

    engine.setupCanvasDimensions();
    engine.renderMenuPreview();

    // Check orientation and setup dimensions dynamically (with threshold guard)
    let lastW = 0;
    let lastH = 0;
    const updateDimensionsAndOrientation = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w;
      lastH = h;
      const portrait = h > w;
      setIsPortrait(portrait);
      engine.setupCanvasDimensions();
      if (gameStateRef.current === 'MENU') {
        engine.renderMenuPreview();
      }
    };

    // Resize Observer to keep crisp aspect ratio on screen or container changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensionsAndOrientation();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Window orientation and viewport change listeners
    const onWindowChange = () => {
      updateDimensionsAndOrientation();
      requestAnimationFrame(updateDimensionsAndOrientation);
    };

    // Android/Browser Lifecycle: Pause when backgrounded, resume audio and sync on foreground
    const onVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      sound.handleVisibilityChange(isVisible);
      engine.handleVisibilityChange(isVisible);
      if (!isVisible && gameStateRef.current === 'PLAYING') {
        setGameState('PAUSED');
      }
    };

    window.addEventListener('resize', onWindowChange, { passive: true });
    window.addEventListener('orientationchange', onWindowChange, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', onWindowChange);
    }

    return () => {
      engine.stop();
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowChange);
      window.removeEventListener('orientationchange', onWindowChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', onWindowChange);
      }
    };
  }, []);

  // Continuous Menu Preview Animation Loop (only while in MENU state)
  useEffect(() => {
    if (gameState !== 'MENU') return;

    let animId: number;
    const loop = () => {
      if (engineRef.current && gameStateRef.current === 'MENU') {
        engineRef.current.renderMenuPreview();
        animId = requestAnimationFrame(loop);
      }
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  // Sync settings/skins to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(selectedSkin);
      engineRef.current.setEntitySkin(selectedEntitySkin);
      engineRef.current.setOrbCosmetic(selectedOrbCosmetic);
      engineRef.current.setPersonalBest(bestScore);
      engineRef.current.setReducedMotion(settings.reducedMotion);
    }
  }, [selectedSkin, selectedEntitySkin, selectedOrbCosmetic, bestScore, settings.reducedMotion]);

  // Start a new run
  const handleStartGame = useCallback(() => {
    sound.playClick();
    setCurrentScore(0);
    setCurrentCombo(0);
    setCurrentMultiplier(1);
    setCurrentDistance(0);
    setCoinsEarnedRun(0);
    setIsLookBackAvailable(false);
    setHasRevivedThisRun(false);
    setGameState('PLAYING');

    // Show tutorial hint for 3.2 seconds
    setShowTutorialHint(true);
    setTimeout(() => {
      setShowTutorialHint(false);
      storage.markTutorialCompleted();
    }, 3200);

    if (engineRef.current) {
      engineRef.current.setPersonalBest(storage.getData().bestScore);
      engineRef.current.setSkin(selectedSkin);
      engineRef.current.setEntitySkin(selectedEntitySkin);
      engineRef.current.setOrbCosmetic(selectedOrbCosmetic);
      engineRef.current.start();
    }

    analytics.logEvent('game_started');
  }, [selectedSkin, selectedEntitySkin, selectedOrbCosmetic]);

  // Look Back Mechanic Action
  const handleTriggerLookBack = useCallback(() => {
    if (gameState === 'PLAYING' && engineRef.current) {
      engineRef.current.triggerLookBack();
      unlockAchievement('first_glance');
    }
  }, [gameState, unlockAchievement]);

  // Action / Tap / Jump handler
  const handlePlayerAction = useCallback(
    (e?: React.SyntheticEvent | KeyboardEvent) => {
      if (e && 'preventDefault' in e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      if (gameState === 'PLAYING') {
        if (engineRef.current) {
          engineRef.current.handleAction();
        }
      } else if (gameState === 'GAME_OVER') {
        handleStartGame();
      } else if (gameState === 'MENU') {
        handleStartGame();
      }
    },
    [gameState, handleStartGame]
  );

  // Keyboard Event Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayerAction(e);
      } else if (e.code === 'KeyB' || e.code === 'KeyQ') {
        // Look Back hotkey
        e.preventDefault();
        handleTriggerLookBack();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          sound.playClick();
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          sound.playClick();
          engineRef.current?.resume();
          setGameState('PLAYING');
        } else if (gameState !== 'MENU' && gameState !== 'OPENING_CUTSCENE') {
          sound.playClick();
          setGameState('MENU');
        }
      } else if (e.code === 'KeyR') {
        if (gameState === 'GAME_OVER' || gameState === 'PLAYING') {
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handlePlayerAction, handleStartGame, handleTriggerLookBack]);

  // Pause Controls
  const handlePauseToggle = useCallback(() => {
    if (gameState === 'PLAYING') {
      engineRef.current?.pause();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      engineRef.current?.resume();
      setGameState('PLAYING');
    }
  }, [gameState]);

  // Sound toggles
  const handleToggleSound = useCallback(() => {
    const updated = storage.updateSettings({ soundEnabled: !settings.soundEnabled });
    setSettings(updated);
  }, [settings.soundEnabled]);

  const handleToggleMusic = useCallback(() => {
    const nextVal = !settings.musicEnabled;
    const updated = storage.updateSettings({ musicEnabled: nextVal });
    setSettings(updated);
    sound.toggleMusic(nextVal);
  }, [settings.musicEnabled]);

  // Skin unlock & selection
  const handleSelectSkin = useCallback((id: SkinId) => {
    storage.selectSkin(id);
    setSelectedSkin(id);
    engineRef.current?.setSkin(id);
  }, []);

  const handleSelectEntitySkin = useCallback((id: EntitySkinId) => {
    storage.selectEntitySkin(id);
    setSelectedEntitySkin(id);
    engineRef.current?.setEntitySkin(id);
  }, []);

  const handleSelectOrbCosmetic = useCallback((id: OrbCosmeticId) => {
    storage.selectOrbCosmetic(id);
    setSelectedOrbCosmetic(id);
    engineRef.current?.setOrbCosmetic(id);
  }, []);

  const handleBuySkinWithOrbs = useCallback(
    (id: SkinId, cost: number) => {
      const success = storage.unlockSkin(id, cost);
      if (success) {
        setSelectedSkin(id);
        setUnlockedSkins([...storage.getData().unlockedSkins]);
        setTotalCoins(storage.getData().coins);
        unlockAchievement('fashionista');
        analytics.logEvent('skin_unlocked', { skin_id: id });
      }
    },
    [unlockAchievement]
  );

  const handleBuyEntitySkinWithOrbs = useCallback((id: EntitySkinId, cost: number) => {
    const success = storage.unlockEntitySkin(id, cost);
    if (success) {
      setSelectedEntitySkin(id);
      setUnlockedEntitySkins([...(storage.getData().unlockedEntitySkins || [])]);
      setTotalCoins(storage.getData().coins);
      analytics.logEvent('entity_skin_unlocked', { skin_id: id });
    }
  }, []);

  const handlePurchaseSuccess = useCallback(() => {
    const data = storage.getData();
    setSelectedSkin(data.selectedSkin);
    setUnlockedSkins([...data.unlockedSkins]);
    setSelectedEntitySkin(data.selectedEntitySkin || 'entity_original');
    setUnlockedEntitySkins([...(data.unlockedEntitySkins || ['entity_original'])]);
    setSelectedOrbCosmetic(data.selectedOrbCosmetic || 'orb_default');
    setUnlockedOrbCosmetics([...(data.unlockedOrbCosmetics || ['orb_default'])]);
    setPurchasedBundles([...(data.purchasedBundles || [])]);
    setAdsRemoved(!!data.adsRemoved);
    setFullStoryUnlocked(!!data.fullStoryUnlocked);
    setSupporterPackUnlocked(!!data.supporterPackUnlocked);
    setTotalCoins(data.coins);
    if (engineRef.current) {
      engineRef.current.setSkin(data.selectedSkin);
      engineRef.current.setEntitySkin(data.selectedEntitySkin || 'entity_original');
      engineRef.current.setOrbCosmetic(data.selectedOrbCosmetic || 'orb_default');
    }
  }, []);

  // Rewarded 5-second revive
  const handleRevive = useCallback(() => {
    setHasRevivedThisRun(true);
    setGameState('PLAYING');
    engineRef.current?.revivePlayer();
  }, []);

  // Claim Daily Challenge reward
  const handleClaimDailyReward = useCallback(
    (reward: number) => {
      const claimed = storage.claimDailyReward(todayKey, reward);
      if (claimed) {
        setDailyChallenge(storage.getDailyChallenge(todayKey));
        setTotalCoins(storage.getData().coins);
        setActiveToast({
          title: `+${reward} Orbs Claimed!`,
          description: 'Spend them in the Skin Locker!',
        });
      }
    },
    [todayKey]
  );

  // Reset progress
  const handleResetData = useCallback(() => {
    storage.resetAll();
    const data = storage.getData();
    setBestScore(data.bestScore);
    setTotalCoins(data.coins);
    setSelectedSkin('default');
    setUnlockedSkins(['default']);
    setSettings(data.settings);
    setAchievementsMap({});
    setDailyChallenge(storage.getDailyChallenge(todayKey));
    setGameState('MENU');
    setActiveToast({
      title: 'Progress Reset',
      description: 'Clean slate established.',
    });
  }, [todayKey]);

  return (
    <div
      id="app-root"
      ref={containerRef}
      className="relative w-full h-screen bg-[#070913] text-white flex items-center justify-center overflow-hidden touch-manipulation select-none"
      onPointerDown={(e) => {
        // Trigger action if clicked directly on playing viewport
        if (gameState === 'PLAYING') {
          handlePlayerAction(e);
        }
      }}
    >
      {/* Game Canvas Container: Seamless edge-to-edge in portrait mode, constrained aspect on desktop/landscape */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
          isPortrait ? 'max-w-full max-h-full' : 'max-w-5xl max-h-[640px]'
        }`}
      >
        <canvas
          id="game-canvas"
          ref={canvasRef}
          className="w-full h-full block cursor-pointer"
          onPointerDown={(e) => {
            if (gameState === 'PLAYING') {
              e.stopPropagation();
              handlePlayerAction(e);
            }
          }}
        />

        {/* In-Game HUD during PLAYING state */}
        {gameState === 'PLAYING' && (
          <HUD
            score={currentScore}
            combo={currentCombo}
            multiplier={currentMultiplier}
            bestScore={bestScore}
            coinsEarned={coinsEarnedRun}
            distance={currentDistance}
            isLookBackAvailable={isLookBackAvailable}
            onLookBack={handleTriggerLookBack}
            isPaused={false}
            isPortrait={isPortrait}
            soundEnabled={settings.soundEnabled}
            musicEnabled={settings.musicEnabled}
            showTutorialHint={showTutorialHint}
            onPauseToggle={handlePauseToggle}
            onSoundToggle={handleToggleSound}
            onMusicToggle={handleToggleMusic}
          />
        )}

        {/* Main Menu Overlay */}
        {gameState === 'MENU' && (
          <MainMenu
            bestScore={bestScore}
            totalCoins={totalCoins}
            onPlay={handleStartGame}
            onOpenCustomize={() => setGameState('CUSTOMIZE')}
            onOpenDaily={() => setGameState('DAILY_CHALLENGE')}
            onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
            onOpenSettings={() => setGameState('SETTINGS')}
            onOpenCredits={() => setIsCreditsModalOpen(true)}
            onOpenLeaderboard={() => setGameState('LEADERBOARD')}
            onOpenStoryJournal={() => setIsStoryJournalOpen(true)}
            onOpenEndings={() => setIsEndingsModalOpen(true)}
            hasDailyRewardReady={dailyChallenge.completed && !dailyChallenge.claimed}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            score={finalRunResult.score}
            bestScore={finalRunResult.bestScore}
            combo={finalRunResult.combo}
            coinsEarned={finalRunResult.coins}
            distance={finalRunResult.distance}
            isNewRecord={finalRunResult.isNewRecord}
            newEndingId={finalRunResult.newEndingId}
            newFragments={finalRunResult.newFragments}
            canRevive={!hasRevivedThisRun}
            onRevive={handleRevive}
            onPlayAgain={handleStartGame}
            onOpenCustomize={() => setGameState('CUSTOMIZE')}
            onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
            onOpenLeaderboard={() => setGameState('LEADERBOARD')}
            onOpenStoryJournal={() => setIsStoryJournalOpen(true)}
            onOpenEndings={() => setIsEndingsModalOpen(true)}
            onWatchEndingCutscene={(ending) => setSelectedEndingForCutscene(ending)}
            onBackToMenu={() => setGameState('MENU')}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            soundEnabled={settings.soundEnabled}
            musicEnabled={settings.musicEnabled}
            onResume={handlePauseToggle}
            onRestart={handleStartGame}
            onQuit={() => {
              engineRef.current?.stop();
              setGameState('MENU');
            }}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* Skin Locker / Customize Modal */}
        {gameState === 'CUSTOMIZE' && (
          <CustomizeModal
            currentSkin={selectedSkin}
            currentEntitySkin={selectedEntitySkin}
            currentOrbCosmetic={selectedOrbCosmetic}
            unlockedSkins={unlockedSkins}
            unlockedEntitySkins={unlockedEntitySkins}
            unlockedOrbCosmetics={unlockedOrbCosmetics}
            purchasedBundles={purchasedBundles}
            adsRemoved={adsRemoved}
            fullStoryUnlocked={fullStoryUnlocked}
            supporterPackUnlocked={supporterPackUnlocked}
            totalCoins={totalCoins}
            onSelectSkin={handleSelectSkin}
            onSelectEntitySkin={handleSelectEntitySkin}
            onSelectOrbCosmetic={handleSelectOrbCosmetic}
            onBuySkinWithOrbs={handleBuySkinWithOrbs}
            onBuyEntitySkinWithOrbs={handleBuyEntitySkinWithOrbs}
            onPurchaseSuccess={handlePurchaseSuccess}
            onClose={() => setGameState('MENU')}
          />
        )}

        {/* Daily Challenge Modal */}
        {gameState === 'DAILY_CHALLENGE' && (
          <DailyChallengeModal
            challenge={dailyChallenge}
            onClaimReward={handleClaimDailyReward}
            onClose={() => setGameState('MENU')}
          />
        )}

        {/* Achievements Modal */}
        {gameState === 'ACHIEVEMENTS' && (
          <AchievementsModal
            unlockedMap={achievementsMap}
            onClose={() => setGameState('MENU')}
          />
        )}

        {/* Leaderboard / Personal Hall of Fame Modal */}
        {gameState === 'LEADERBOARD' && (
          <LeaderboardModal onClose={() => setGameState('MENU')} />
        )}

        {/* Settings Modal */}
        {gameState === 'SETTINGS' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(partial) => {
              const updated = storage.updateSettings(partial);
              setSettings(updated);
              sound.updateGainLevels();
            }}
            onResetData={handleResetData}
            onClose={() => setGameState('MENU')}
            onPlayCutscene={() => {
              setGameState('OPENING_CUTSCENE');
            }}
          />
        )}

        {/* Story Journal Modal */}
        <StoryJournalModal
          isOpen={isStoryJournalOpen}
          onClose={() => setIsStoryJournalOpen(false)}
        />

        {/* Endings Archive Modal */}
        <EndingsModal
          isOpen={isEndingsModalOpen}
          onClose={() => setIsEndingsModalOpen(false)}
          onViewEndingCutscene={(ending) => {
            setSelectedEndingForCutscene(ending);
          }}
          onPlayFinalStoryCutscene={() => setIsFinalCutsceneOpen(true)}
        />

        {/* Cinematic Ending Cutscene Modal */}
        <EndingCutsceneModal
          ending={selectedEndingForCutscene}
          onClose={handleCloseEndingCutscene}
        />

        {/* Final Story Cutscene Modal (After all 7 endings) */}
        <FinalStoryCutsceneModal
          isOpen={isFinalCutsceneOpen}
          onClose={() => setIsFinalCutsceneOpen(false)}
        />

        {/* Credits Modal */}
        <CreditsModal
          isOpen={isCreditsModalOpen}
          onClose={() => setIsCreditsModalOpen(false)}
        />

        {/* Opening Prologue Cinematic Cutscene */}
        {gameState === 'OPENING_CUTSCENE' && (
          <OpeningCutscene
            onComplete={() => {
              storage.markOpeningCutsceneSeen();
              setGameState('MENU');
            }}
          />
        )}

        {/* Achievement Toast */}
        {activeToast && (
          <AchievementToast
            title={activeToast.title}
            description={activeToast.description}
            onDismiss={() => setActiveToast(null)}
          />
        )}
      </div>
    </div>
  );
}
