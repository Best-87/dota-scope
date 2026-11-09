import { useEffect, useRef, useCallback } from 'react';
import { getRecentMatches } from '../api/opendota';
import type { RecentMatch } from '../api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchPollerOptions {
  accountId: number | null;
  enabled: boolean;
  intervalMs?: number; // default 1 min
  onNewMatch: (match: RecentMatch) => void;
  onMatchParsed: (match: RecentMatch) => void;
}

const POLL_PREFIX = 'dotascope_poller_state_u_';

interface PollerState {
  lastMatchId: number | null;
  lastChecked: number;
  knownParsed: number[]; // match IDs already seen as parsed
}

function loadState(accountId: number | null): PollerState {
  try {
    const key = accountId ? `${POLL_PREFIX}${accountId}` : `${POLL_PREFIX}guest`;
    const raw = localStorage.getItem(key);
    if (!raw) return { lastMatchId: null, lastChecked: 0, knownParsed: [] };
    return JSON.parse(raw) as PollerState;
  } catch {
    return { lastMatchId: null, lastChecked: 0, knownParsed: [] };
  }
}

function saveState(accountId: number | null, s: PollerState) {
  try {
    const key = accountId ? `${POLL_PREFIX}${accountId}` : `${POLL_PREFIX}guest`;
    // Keep knownParsed limited to last 50
    s.knownParsed = s.knownParsed.slice(-50);
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    // Ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMatchPoller({
  accountId,
  enabled,
  intervalMs = 60 * 1000,
  onNewMatch,
  onMatchParsed,
}: MatchPollerOptions) {
  const stateRef = useRef<PollerState>(loadState(accountId));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onNewMatchRef = useRef(onNewMatch);
  const onMatchParsedRef = useRef(onMatchParsed);

  // Reload state whenever accountId changes
  useEffect(() => {
    stateRef.current = loadState(accountId);
  }, [accountId]);

  // Always keep callbacks fresh
  useEffect(() => { onNewMatchRef.current = onNewMatch; }, [onNewMatch]);
  useEffect(() => { onMatchParsedRef.current = onMatchParsed; }, [onMatchParsed]);

  const poll = useCallback(async () => {
    if (!accountId) return;
    try {
      const matches = await getRecentMatches(accountId);
      if (!Array.isArray(matches) || matches.length === 0) return;

      const state = stateRef.current;
      const newest = matches[0];

      // Detect new match
      if (state.lastMatchId !== null && newest.match_id !== state.lastMatchId) {
        // New match detected — find all new ones
        const newMatches = matches.filter((m) => m.match_id > (state.lastMatchId ?? 0));
        newMatches.forEach((m) => onNewMatchRef.current(m));
      }

      // Detect newly parsed matches (version > 0 means parsed by OpenDota)
      // A match is "parsed" when it has version field > 0
      matches.slice(0, 10).forEach((m) => {
        const isParsed = (m as any).version && (m as any).version > 0;
        if (isParsed && !state.knownParsed.includes(m.match_id)) {
          state.knownParsed.push(m.match_id);
          onMatchParsedRef.current(m);
        }
      });

      // Update state
      state.lastMatchId = newest.match_id;
      state.lastChecked = Date.now();
      saveState(accountId, state);
    } catch {
      // Network error, silently ignore
    }
  }, [accountId]);

  // Initialize knownParsed from first fetch (don't notify for already-known data)
  const initialized = useRef(false);
  const initRef = useRef<(() => Promise<void>) | null>(null);
  initRef.current = async () => {
    if (!accountId || initialized.current) return;
    initialized.current = true;
    try {
      const matches = await getRecentMatches(accountId);
      if (!Array.isArray(matches)) return;
      const state = stateRef.current;
      if (state.lastMatchId === null) {
        // First time: seed state without firing callbacks
        state.lastMatchId = matches[0]?.match_id ?? null;
        matches.slice(0, 10).forEach((m) => {
          const isParsed = (m as any).version && (m as any).version > 0;
          if (isParsed && !state.knownParsed.includes(m.match_id)) {
            state.knownParsed.push(m.match_id);
          }
        });
        state.lastChecked = Date.now();
        saveState(accountId, state);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!enabled || !accountId) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      initialized.current = false;
      return;
    }

    // Init first, then start polling
    initRef.current?.().then(() => {
      timerRef.current = setInterval(poll, intervalMs);
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, accountId, intervalMs, poll]);

  return { poll };
}

export default useMatchPoller;
