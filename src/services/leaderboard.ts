import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, PlayerIdentity } from '../types';
import { storage } from './storage';
import { securityService } from './security';
import {
  getPlayerIdentity,
  getPlayerDisplayName,
  setPlayerDisplayName,
  setAuthenticatedUserId,
  isCurrentPlayer,
} from './identity';

export interface OnlineLeaderboardEntry {
  id: string;
  player_id?: string | null;
  created_at?: string;
  display_name: string;
  score: number;
  distance?: number;
  run_duration?: number;
  ending_id?: string | null;
  skin_id?: string;
}

export interface ScoreSubmissionResult {
  rank: number;
  isTopScore: boolean;
  onlineSubmitted: boolean;
  message?: string;
}

export interface ILeaderboardService {
  isOnline(): boolean;
  getIdentity(): PlayerIdentity;
  getPlayerName(): string;
  setPlayerName(name: string): string;
  getTopScores(limit?: number): Promise<LeaderboardEntry[]>;
  getGlobalTopScores(limit?: number): Promise<OnlineLeaderboardEntry[]>;
  submitScore(
    entry: LeaderboardEntry,
    distance?: number,
    endingId?: string | null,
    playerName?: string,
    runSessionId?: string
  ): Promise<ScoreSubmissionResult>;
}

// Re-export identity utilities for backward compatibility & centralized access
export {
  getPlayerIdentity,
  getPlayerDisplayName,
  setPlayerDisplayName,
  isCurrentPlayer,
};

export const getStoredPlayerName = getPlayerDisplayName;
export const setStoredPlayerName = setPlayerDisplayName;

const DEFAULT_SUPABASE_URL = 'https://nqzonmdosoxdgdezngwp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_hHnY4C3RetDPcMk_6v8QsA_uqVBrL1R';

export class SupabaseLeaderboardService implements ILeaderboardService {
  private client: SupabaseClient | null = null;
  private url: string;
  private anonKey: string;

  constructor() {
    this.url =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
      DEFAULT_SUPABASE_URL;
    this.anonKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
      DEFAULT_SUPABASE_ANON_KEY;

    this.initClient();
  }

  private initClient(): void {
    if (!this.client && this.url && this.anonKey && this.anonKey.trim() !== '') {
      try {
        this.client = createClient(this.url, this.anonKey.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });

        // Sync authenticated user identity if session exists
        this.client.auth
          .getSession()
          .then(({ data: { session } }) => {
            if (session?.user?.id) {
              setAuthenticatedUserId(session.user.id);
            }
          })
          .catch(() => {});

        this.client.auth.onAuthStateChange((_event, session) => {
          setAuthenticatedUserId(session?.user?.id || null);
        });
      } catch (err) {
        // Deferred initialisation without crashing
        console.warn("DON'T BLINK: Supabase initialization deferred.");
      }
    }
  }

  public isOnline(): boolean {
    return !!(this.client && this.anonKey && this.anonKey.trim() !== '');
  }

  public getIdentity(): PlayerIdentity {
    return getPlayerIdentity();
  }

  public getPlayerName(): string {
    return getPlayerDisplayName();
  }

  public setPlayerName(name: string): string {
    return setPlayerDisplayName(name);
  }

  public async getTopScores(limit = 50): Promise<LeaderboardEntry[]> {
    const data = storage.getData();
    return [...data.history].slice(0, limit);
  }

  public async getGlobalTopScores(limit = 100): Promise<OnlineLeaderboardEntry[]> {
    this.initClient();
    if (!this.client) {
      return [];
    }

    try {
      // 1. Primary query: Requests actual schema columns including player_id
      const { data, error } = await this.client
        .from('leaderboard')
        .select('id, created_at, display_name, score, player_id')
        .order('score', { ascending: false })
        .limit(Math.min(100, Math.max(1, limit)));

      if (error) {
        // 2. Adaptive fallback: If player_id column has not been added to remote DB yet (42703),
        // fallback to base columns to eliminate HTTP 400 crashes completely
        if (error.code === '42703' || error.message?.includes('player_id')) {
          const fallback = await this.client
            .from('leaderboard')
            .select('id, created_at, display_name, score')
            .order('score', { ascending: false })
            .limit(Math.min(100, Math.max(1, limit)));

          if (fallback.error) {
            console.warn("DON'T BLINK: Leaderboard fallback query warning:", fallback.error.message);
            return [];
          }
          return (fallback.data as OnlineLeaderboardEntry[]) || [];
        }

        console.warn("DON'T BLINK: Leaderboard query warning:", error.message);
        return [];
      }

      return (data as OnlineLeaderboardEntry[]) || [];
    } catch {
      // Graceful offline fallback
      return [];
    }
  }

  public async submitScore(
    entry: LeaderboardEntry,
    distance = 0,
    endingId: string | null = null,
    customPlayerName?: string,
    runSessionId?: string
  ): Promise<ScoreSubmissionResult> {
    const identity = getPlayerIdentity();
    const rawName = customPlayerName || identity.displayName;

    // 1. Anti-Cheat & Physical Bounds Validation
    const validation = securityService.validateRunMetrics(
      entry.score,
      distance,
      entry.durationSeconds,
      entry.coinsEarned,
      rawName,
      endingId,
      entry.skinUsed,
      runSessionId
    );

    // 2. Always record sanitized data in local storage with player_id bound to the run
    const sanitizedEntry: LeaderboardEntry = {
      ...entry,
      player_id: identity.playerId,
      score: validation.sanitizedScore,
      distance: validation.sanitizedDistance,
      durationSeconds: validation.sanitizedDuration,
      coinsEarned: validation.sanitizedCoins,
      playerName: validation.sanitizedPlayerName,
      display_name: validation.sanitizedPlayerName,
      endingId: validation.sanitizedEndingId,
      skinUsed: validation.sanitizedSkinId,
    };
    storage.recordRun(sanitizedEntry);

    const updated = storage.getData().history;
    const index = updated.findIndex((item) => item.id === entry.id);
    const rank = index >= 0 ? index + 1 : updated.length + 1;
    const isTopScore = rank === 1;

    // If physics validation failed (e.g. absurd score or duplicate replay session), abort online submission
    if (!validation.valid) {
      return {
        rank,
        isTopScore,
        onlineSubmitted: false,
        message: validation.reason || 'Invalid run parameters',
      };
    }

    // 3. Anti-Spam Rate Limiting Guard
    const rateLimit = securityService.checkRateLimit();
    if (!rateLimit.allowed) {
      return {
        rank,
        isTopScore,
        onlineSubmitted: false,
        message: rateLimit.reason,
      };
    }

    // 4. Mark session consumed immediately to prevent replay attacks
    if (runSessionId) {
      securityService.markSessionConsumed(runSessionId);
    }

    // 5. Submit to Supabase if client is configured
    let onlineSubmitted = false;
    let submitMessage: string | undefined;

    this.initClient();
    if (this.client) {
      try {
        // Attempt insert with player_id included
        const fullPayload = {
          player_id: identity.playerId,
          display_name: validation.sanitizedPlayerName,
          score: validation.sanitizedScore,
        };

        let { error } = await this.client.from('leaderboard').insert([fullPayload]);

        // Adaptive fallback: if remote table does not have player_id column yet (42703),
        // gracefully submit without player_id so user's score is never lost
        if (error && (error.code === '42703' || error.message?.includes('player_id'))) {
          const fallbackPayload = {
            display_name: validation.sanitizedPlayerName,
            score: validation.sanitizedScore,
          };
          const fallbackRes = await this.client.from('leaderboard').insert([fallbackPayload]);
          error = fallbackRes.error;
        }

        if (!error) {
          onlineSubmitted = true;
          securityService.recordOnlineSubmissionSuccess();
        } else {
          submitMessage = error.message;
          console.warn("DON'T BLINK: Supabase submission warning:", error.message);
        }
      } catch (err: any) {
        submitMessage = 'Network connection unavailable';
        console.warn("DON'T BLINK: Supabase offline / network error:", err?.message || err);
      }
    } else {
      submitMessage = 'Offline mode: score recorded locally';
    }

    return { rank, isTopScore, onlineSubmitted, message: submitMessage };
  }
}

// Export singleton instance
export const leaderboardService: ILeaderboardService = new SupabaseLeaderboardService();
