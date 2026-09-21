import { storage } from './storage';
import { StoryState, EndingId } from '../types';
import { STORY_CHAPTERS, STORY_FRAGMENTS, GAME_ENDINGS } from '../data/storyData';
import { sound } from './audio';

export interface StoryEventNotification {
  type: 'fragment' | 'chapter' | 'ending' | 'secret';
  id: string;
  title: string;
  subtitle?: string;
}

class StoryManager {
  private inRunFragmentsUnlockedThisRun: string[] = [];
  private inRunEndingTriggered: EndingId | null = null;
  private pendingNotifications: StoryEventNotification[] = [];

  public getStoryState(): StoryState {
    return storage.getStoryState();
  }

  public getPendingNotifications(): StoryEventNotification[] {
    const list = [...this.pendingNotifications];
    this.pendingNotifications = [];
    return list;
  }

  public resetRunState(): void {
    this.inRunFragmentsUnlockedThisRun = [];
    this.inRunEndingTriggered = null;
  }

  // --- Factor Updaters ---

  public addCourage(amount: number): void {
    const s = storage.getStoryState();
    storage.updateStoryFactors({ courage: s.courage + amount });
  }

  public addFear(amount: number): void {
    const s = storage.getStoryState();
    storage.updateStoryFactors({ fear: s.fear + amount });
  }

  public addMemory(amount: number): void {
    const s = storage.getStoryState();
    storage.updateStoryFactors({ memory: s.memory + amount });
  }

  public addCorruption(amount: number): void {
    const s = storage.getStoryState();
    storage.updateStoryFactors({ corruption: s.corruption + amount });
  }

  public addAwareness(amount: number): void {
    const s = storage.getStoryState();
    storage.updateStoryFactors({ awareness: s.awareness + amount });
  }

  // --- In-Game Event Handlers ---

  public onObstacleDodged(isNearMiss: boolean, currentSpeed: number): void {
    if (isNearMiss) {
      this.addCourage(1.5);
      this.addAwareness(1);
    } else {
      this.addCourage(0.4);
    }

    if (currentSpeed > 10) {
      this.addCourage(0.8);
    }
  }

  public onComboMilestone(multiplier: number): void {
    if (multiplier >= 4) {
      this.addCourage(2);
    }
    if (multiplier >= 6) {
      this.addCourage(4);
      this.checkFragmentMilestone('high_combo');
    }
  }

  public onDangerPhaseEntered(phase: 'NIGHT' | 'NEON'): void {
    if (phase === 'NIGHT') {
      this.addAwareness(4);
      this.addFear(2);
      this.checkFragmentMilestone('night_phase');
    } else if (phase === 'NEON') {
      this.addAwareness(8);
      this.addCourage(5);
      this.checkFragmentMilestone('neon_phase');
    }
  }

  public onDistanceProgress(distance: number): void {
    if (distance >= 500) this.checkFragmentMilestone('dist_500');
    if (distance >= 1200) this.checkFragmentMilestone('dist_1200');
    if (distance >= 2000) this.checkFragmentMilestone('dist_2000');
    if (distance >= 3000) this.checkFragmentMilestone('dist_3000');
    if (distance >= 4000) this.checkFragmentMilestone('dist_4000');

    this.checkChapterUnlocks();
  }

  public onAnomalyCollected(type: 'MEMORY_SHARD' | 'CORRUPTED_ANOMALY'): void {
    if (type === 'MEMORY_SHARD') {
      this.addMemory(6);
      this.addAwareness(5);
      this.checkFragmentMilestone('memory_shard');
    } else if (type === 'CORRUPTED_ANOMALY') {
      this.addCorruption(12);
      this.addAwareness(3);
      this.checkFragmentMilestone('corrupted_shard');
    }
  }

  public onLookBackTriggered(): { triggeredEnding: EndingId | null } {
    sound.playLookBack();
    const s = storage.getStoryState();

    this.addCorruption(16);
    this.addAwareness(18);
    this.addFear(15);
    storage.registerSecretEvent('look_back_activated');

    // Unlock Look Back fragment if not already
    this.unlockFragment('frag_13');

    // If already in deep danger (distance > 500 or corruption > 30), triggers Ending 03 (YOU BLINKED)
    if (!s.unlockedEndings.includes('ending_03')) {
      const unlocked = this.unlockEnding('ending_03');
      if (unlocked) {
        this.inRunEndingTriggered = 'ending_03';
        return { triggeredEnding: 'ending_03' };
      }
    }

    return { triggeredEnding: null };
  }

  // --- Run Completion & Ending Evaluation ---

  public evaluateRunCompletion(
    score: number,
    distance: number,
    duration: number,
    _combo: number
  ): { newlyUnlockedEnding: EndingId | null; newlyUnlockedFragments: string[] } {
    const s = storage.getStoryState();
    let endingToUnlock: EndingId | null = this.inRunEndingTriggered;

    // Check Fear increment on Game Over
    this.addFear(4);

    // Evaluate Ending conditions:
    // Ending 07 (DON'T BLINK - True Ending):
    // Requires >= 14 fragments, high courage, high awareness, low corruption, and 3500m+
    if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_07') &&
      s.unlockedFragments.length >= 14 &&
      s.courage >= 50 &&
      s.awareness >= 60 &&
      s.corruption <= 20 &&
      distance >= 3500
    ) {
      endingToUnlock = 'ending_07';
    }

    // Ending 04 (THE THING):
    // High corruption >= 50 and distance >= 1200m
    else if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_04') &&
      s.corruption >= 50 &&
      distance >= 1200
    ) {
      endingToUnlock = 'ending_04';
    }

    // Ending 05 (THE MEMORY):
    // Extensive fragments (10+) and high memory >= 55
    else if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_05') &&
      s.unlockedFragments.length >= 10 &&
      s.memory >= 55
    ) {
      endingToUnlock = 'ending_05';
    }

    // Ending 02 (THE TRUTH):
    // High awareness (>= 50), memory (>= 40), and 6+ fragments
    else if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_02') &&
      s.unlockedFragments.length >= 6 &&
      s.awareness >= 50 &&
      s.memory >= 40
    ) {
      endingToUnlock = 'ending_02';
    }

    // Ending 06 (FALSE ESCAPE):
    // Reached 3000m+ but low awareness (< 40)
    else if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_06') &&
      distance >= 3000 &&
      s.awareness < 45
    ) {
      endingToUnlock = 'ending_06';
    }

    // Ending 01 (THE ESCAPE):
    // Reached 2500m+ with Courage >= 40 and Corruption <= 25
    else if (
      !endingToUnlock &&
      !s.unlockedEndings.includes('ending_01') &&
      distance >= 2500 &&
      s.courage >= 40 &&
      s.corruption <= 25
    ) {
      endingToUnlock = 'ending_01';
    }

    if (endingToUnlock) {
      this.unlockEnding(endingToUnlock);
    }

    this.checkChapterUnlocks();

    return {
      newlyUnlockedEnding: endingToUnlock,
      newlyUnlockedFragments: [...this.inRunFragmentsUnlockedThisRun],
    };
  }

  // --- Fragment & Chapter Unlocks ---

  public unlockFragment(fragmentId: string): boolean {
    const success = storage.unlockFragment(fragmentId);
    if (success) {
      sound.playFragmentDiscovered();
      this.inRunFragmentsUnlockedThisRun.push(fragmentId);
      const frag = STORY_FRAGMENTS.find((f) => f.id === fragmentId);
      if (frag) {
        this.pendingNotifications.push({
          type: 'fragment',
          id: frag.id,
          title: `FRAGMEN #${frag.number}: ${frag.title.id}`,
          subtitle: frag.excerpt.id,
        });
      }
      this.checkChapterUnlocks();
    }
    return success;
  }

  public unlockEnding(endingId: EndingId): boolean {
    const success = storage.unlockEnding(endingId);
    if (success) {
      sound.playEndingUnlocked();
      const end = GAME_ENDINGS.find((e) => e.id === endingId);
      if (end) {
        this.pendingNotifications.push({
          type: 'ending',
          id: end.id,
          title: `ENDING ${end.number}: ${end.title.id}`,
          subtitle: end.subtitle.id,
        });
      }
      this.checkChapterUnlocks();
    }
    return success;
  }

  public checkChapterUnlocks(): void {
    const s = storage.getStoryState();
    const stats = storage.getData().stats;

    // Chapter 2: totalDistance >= 3000 or fragments >= 3
    if (
      !s.unlockedChapters.includes('chapter_2') &&
      (stats.totalDistance >= 3000 || s.unlockedFragments.length >= 3)
    ) {
      this.unlockChapterInternal('chapter_2');
    }

    // Chapter 3: fragments >= 6
    if (!s.unlockedChapters.includes('chapter_3') && s.unlockedFragments.length >= 6) {
      this.unlockChapterInternal('chapter_3');
    }

    // Chapter 4: fragments >= 10 or lookBackCount >= 1
    if (
      !s.unlockedChapters.includes('chapter_4') &&
      (s.unlockedFragments.length >= 10 || s.lookBackCount >= 1)
    ) {
      this.unlockChapterInternal('chapter_4');
    }

    // Chapter 5: 2+ endings unlocked
    if (!s.unlockedChapters.includes('chapter_5') && s.unlockedEndings.length >= 2) {
      this.unlockChapterInternal('chapter_5');
    }

    // Chapter 6 (Final): 4+ endings or 16+ fragments
    if (
      !s.unlockedChapters.includes('chapter_6') &&
      (s.unlockedEndings.length >= 4 || s.unlockedFragments.length >= 16)
    ) {
      this.unlockChapterInternal('chapter_6');
    }
  }

  private unlockChapterInternal(chapterId: string): void {
    const success = storage.unlockChapter(chapterId);
    if (success) {
      sound.playChapterUnlocked();
      const ch = STORY_CHAPTERS.find((c) => c.id === chapterId);
      if (ch) {
        this.pendingNotifications.push({
          type: 'chapter',
          id: ch.id,
          title: ch.title.id,
          subtitle: ch.teaser.id,
        });
      }
    }
  }

  private checkFragmentMilestone(trigger: string): void {
    switch (trigger) {
      case 'dist_500':
        this.unlockFragment('frag_02');
        break;
      case 'dist_1200':
        this.unlockFragment('frag_04');
        break;
      case 'dist_2000':
        this.unlockFragment('frag_08');
        break;
      case 'dist_3000':
        this.unlockFragment('frag_12');
        break;
      case 'dist_4000':
        this.unlockFragment('frag_19');
        break;
      case 'night_phase':
        this.unlockFragment('frag_05');
        this.unlockFragment('frag_07');
        break;
      case 'neon_phase':
        this.unlockFragment('frag_11');
        this.unlockFragment('frag_18');
        break;
      case 'memory_shard': {
        const memoryPool = ['frag_06', 'frag_10', 'frag_14', 'frag_16', 'frag_20'];
        const s = storage.getStoryState();
        const uncollected = memoryPool.find((f) => !s.unlockedFragments.includes(f));
        if (uncollected) this.unlockFragment(uncollected);
        break;
      }
      case 'corrupted_shard':
        this.unlockFragment('frag_15');
        this.unlockFragment('frag_17');
        break;
      case 'high_combo':
        this.unlockFragment('frag_09');
        break;
    }
  }
}

export const story = new StoryManager();
