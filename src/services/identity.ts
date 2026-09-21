// ==============================================================================
// DON'T BLINK — Player Identity Engine (Decoupled Identity & Display Name)
// ==============================================================================

import { PlayerIdentity } from '../types';
import { securityService } from './security';

export const STORAGE_PLAYER_ID_KEY = 'dont_blink_player_id';
export const STORAGE_PLAYER_NAME_KEY = 'dont_blink_player_name';

/**
 * Generates an RFC4122 v4 compliant high-entropy UUID.
 * Never derived from display name, hash, timestamp-alone, or user agent.
 */
export function generatePlayerUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if browser environment restricts randomUUID
    }
  }

  // Cryptographically strong random bytes if available
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 10xx
    const hex = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
  }

  // Math.random fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// In-memory cache for fast, synchronous access
let cachedGuestPlayerId: string | null = null;
let activeAuthUserId: string | null = null;

/**
 * Retrieves the persistent guest player ID from localStorage, or generates
 * and stores a new unique UUID if not already present.
 */
export function getOrCreateGuestPlayerId(): string {
  if (cachedGuestPlayerId && cachedGuestPlayerId.trim().length > 0) {
    return cachedGuestPlayerId;
  }

  if (typeof window === 'undefined') {
    return '00000000-0000-4000-8000-000000000000';
  }

  try {
    const stored = localStorage.getItem(STORAGE_PLAYER_ID_KEY);
    if (stored && typeof stored === 'string' && stored.trim().length > 0) {
      cachedGuestPlayerId = stored.trim();
      return cachedGuestPlayerId;
    }

    // Generate fresh high-entropy UUID (completely decoupled from display_name)
    const newId = generatePlayerUUID();
    localStorage.setItem(STORAGE_PLAYER_ID_KEY, newId);
    cachedGuestPlayerId = newId;
    return newId;
  } catch {
    // If storage is unavailable (e.g. strict private mode), use ephemeral UUID
    if (!cachedGuestPlayerId) {
      cachedGuestPlayerId = generatePlayerUUID();
    }
    return cachedGuestPlayerId;
  }
}

/**
 * Returns the current player display name (callsign).
 * Nickname is strictly user-facing presentation and NOT an identifier.
 */
export function getPlayerDisplayName(): string {
  if (typeof window === 'undefined') return 'Runner';
  try {
    const saved = localStorage.getItem(STORAGE_PLAYER_NAME_KEY);
    if (saved && typeof saved === 'string') {
      return securityService.sanitizePlayerName(saved);
    }
  } catch {
    // Fallback
  }
  return 'Runner';
}

/**
 * Updates the user-facing nickname.
 * CRITICAL: The persistent player_id remains completely unchanged.
 */
export function setPlayerDisplayName(name: string): string {
  const sanitized = securityService.sanitizePlayerName(name);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_PLAYER_NAME_KEY, sanitized);
    } catch {
      // Fallback
    }
  }
  return sanitized;
}

/**
 * Registers an active authenticated user ID (e.g. from Supabase Auth).
 * When present, authenticated user ID takes precedence over guest UUID.
 */
export function setAuthenticatedUserId(userId: string | null): void {
  activeAuthUserId = userId && userId.trim().length > 0 ? userId.trim() : null;
}

/**
 * Returns the active authenticated user ID if signed in.
 */
export function getAuthenticatedUserId(): string | null {
  return activeAuthUserId;
}

/**
 * Centralized identity helper:
 * Returns the authoritative PlayerIdentity object.
 */
export function getPlayerIdentity(): PlayerIdentity {
  const authId = getAuthenticatedUserId();
  if (authId) {
    return {
      playerId: authId,
      displayName: getPlayerDisplayName(),
      isAuthenticated: true,
    };
  }

  return {
    playerId: getOrCreateGuestPlayerId(),
    displayName: getPlayerDisplayName(),
    isAuthenticated: false,
  };
}

/**
 * Determines whether a given record belongs to the current player.
 * NEVER matches by nickname / display_name.
 * Legacy entries without a player_id are treated as unowned/legacy records.
 */
export function isCurrentPlayer(targetPlayerId?: string | null): boolean {
  if (!targetPlayerId || typeof targetPlayerId !== 'string') {
    return false;
  }
  const identity = getPlayerIdentity();
  return targetPlayerId.trim() === identity.playerId.trim();
}
