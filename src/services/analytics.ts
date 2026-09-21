// ==============================================================================
// DON'T BLINK — Comprehensive Real Telemetry & Analytics Service
// ==============================================================================
// Tracks player progression, run milestones, cosmetic unlocks, and system health
// with persistent local telemetry buffers, standard browser analytics hooks
// (window.gtag, window.dataLayer), and window custom event dispatchers.
// ==============================================================================

export type AnalyticsEvent =
  | 'game_started'
  | 'game_over'
  | 'score_reached'
  | 'new_record'
  | 'daily_challenge_completed'
  | 'achievement_unlocked'
  | 'skin_unlocked'
  | 'share_clicked'
  | 'revive_clicked'
  | 'ad_watched'
  | 'ad_interstitial_requested'
  | 'ad_interstitial_completed'
  | 'ad_rewarded_requested'
  | 'ad_rewarded_completed'
  | 'purchase_clicked'
  | (string & {});

export type AnalyticsParamValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsParamValue>;

export interface AnalyticsRecord {
  id: string;
  eventName: string;
  params: AnalyticsParams;
  timestamp: number;
  isoTime: string;
  sessionId: string;
}

export interface SessionMetrics {
  sessionId: string;
  sessionStartedAt: number;
  totalEventsLogged: number;
  runsStarted: number;
  runsCompleted: number;
  achievementsUnlocked: number;
  skinsUnlocked: number;
}

const STORAGE_KEY = 'dont_blink_telemetry_v1';
const USER_ID_KEY = 'dont_blink_anon_user_id';
const MAX_STORED_EVENTS = 100;

class AnalyticsService {
  private enabled: boolean = true;
  private sessionId: string;
  private userId: string;
  private sessionStartedAt: number;
  private eventHistory: AnalyticsRecord[] = [];
  private metrics: SessionMetrics;

  constructor() {
    this.sessionStartedAt = Date.now();
    this.sessionId = this.generateId('sess');
    this.userId = this.resolveUserId();
    this.metrics = {
      sessionId: this.sessionId,
      sessionStartedAt: this.sessionStartedAt,
      totalEventsLogged: 0,
      runsStarted: 0,
      runsCompleted: 0,
      achievementsUnlocked: 0,
      skinsUnlocked: 0,
    };

    this.loadHistory();
  }

  private generateId(prefix: string): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private resolveUserId(): string {
    if (typeof window === 'undefined') return 'server_user';
    try {
      const stored = localStorage.getItem(USER_ID_KEY);
      if (stored) return stored;
      const newId = this.generateId('usr');
      localStorage.setItem(USER_ID_KEY, newId);
      return newId;
    } catch {
      return this.generateId('usr_ephemeral');
    }
  }

  private loadHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.eventHistory = parsed.slice(-MAX_STORED_EVENTS);
        }
      }
    } catch {
      this.eventHistory = [];
    }
  }

  private persistHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      const trimmed = this.eventHistory.slice(-MAX_STORED_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Storage unavailable or quota exceeded; failsafe
    }
  }

  /**
   * Primary logging API consumed throughout DON'T BLINK
   */
  public logEvent(eventName: AnalyticsEvent, params?: AnalyticsParams): void {
    if (!this.enabled) return;

    const safeParams: AnalyticsParams = {
      ...(params || {}),
      user_id: this.userId,
      session_id: this.sessionId,
    };

    const record: AnalyticsRecord = {
      id: this.generateId('evt'),
      eventName,
      params: safeParams,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    // 1. Update internal metrics
    this.metrics.totalEventsLogged += 1;
    if (eventName === 'game_started') this.metrics.runsStarted += 1;
    if (eventName === 'game_over') this.metrics.runsCompleted += 1;
    if (eventName === 'achievement_unlocked') this.metrics.achievementsUnlocked += 1;
    if (eventName === 'skin_unlocked') this.metrics.skinsUnlocked += 1;

    // 2. Buffer in memory & localStorage
    this.eventHistory.push(record);
    this.persistHistory();

    // 3. Dispatch standard DOM CustomEvent for host apps / parent iframes
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        const customEvent = new CustomEvent('dontblink:analytics', {
          detail: record,
        });
        window.dispatchEvent(customEvent);
      } catch {
        // Safe fallback in restricted iframes
      }
    }

    // 4. Google Analytics / gtag.js bridge (if present in hosting HTML)
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      try {
        (window as any).gtag('event', eventName, safeParams);
      } catch {
        // Ignore gtag bridge errors
      }
    }

    // 5. Google Tag Manager / dataLayer bridge (if present)
    if (typeof window !== 'undefined' && Array.isArray((window as any).dataLayer)) {
      try {
        (window as any).dataLayer.push({
          event: eventName,
          ...safeParams,
        });
      } catch {
        // Ignore dataLayer bridge errors
      }
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getMetricsSummary(): SessionMetrics {
    return { ...this.metrics };
  }

  public getRecentEvents(limit: number = 20): AnalyticsRecord[] {
    return this.eventHistory.slice(-Math.min(limit, MAX_STORED_EVENTS));
  }

  public clearHistory(): void {
    this.eventHistory = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage fail-safe
      }
    }
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton analytics instance
export const analytics = new AnalyticsService();
