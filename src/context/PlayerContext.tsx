import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { getPlayer } from '../api/opendota';
import type { Player } from '../api/types';

// ─── Player History ────────────────────────────────────────────────────────────
export interface PlayerHistoryEntry {
  accountId: number;
  personaname: string;
  avatarfull: string;
  lastSeen: number; // Unix timestamp ms
}

const STORAGE_KEY = 'dotascope_account_id';
const HISTORY_KEY = 'dota_player_history';
const MAX_HISTORY = 5;

function loadHistory(): PlayerHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PlayerHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: PlayerHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors
  }
}

function addToHistory(
  history: PlayerHistoryEntry[],
  entry: PlayerHistoryEntry
): PlayerHistoryEntry[] {
  // Remove existing entry for same account, push newest to front
  const filtered = history.filter((h) => h.accountId !== entry.accountId);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  return updated;
}

// ─── Context Shape ─────────────────────────────────────────────────────────────
export interface PlayerContextValue {
  accountId: number | null;
  account_id: number | null;
  player: Player | null;
  loading: boolean;
  error: Error | null;
  setAccountId: (id: number) => void;
  refetchPlayer: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
  // History
  playerHistory: PlayerHistoryEntry[];
  clearHistory: () => void;
}

export const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export interface PlayerProviderProps {
  children: ReactNode;
  initialAccountId?: number;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({
  children,
  initialAccountId,
}) => {
  const [accountId, setAccountIdState] = useState<number | null>(() => {
    if (initialAccountId !== undefined && initialAccountId !== null) {
      return initialAccountId;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !isNaN(Number(saved))) {
        return Number(saved);
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  });

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>(() => loadHistory());

  const setAccountId = useCallback((id: number) => {
    setAccountIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearHistory = useCallback(() => {
    setPlayerHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refetchPlayer = useCallback(async () => {
    if (!accountId) {
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getPlayer(accountId);
      setPlayer(data);
      // Update history once we have the profile data
      const personaname =
        (data as any)?.profile?.personaname || (data as any)?.personaname || `ID ${accountId}`;
      const avatarfull =
        (data as any)?.profile?.avatarfull || (data as any)?.avatarfull || '';
      const newEntry: PlayerHistoryEntry = {
        accountId,
        personaname,
        avatarfull,
        lastSeen: Date.now(),
      };
      setPlayerHistory((prev) => {
        const updated = addToHistory(prev, newEntry);
        saveHistory(updated);
        return updated;
      });
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to fetch player profile');
      setError(formattedError);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    let active = true;

    if (!accountId) {
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getPlayer(accountId)
      .then((data) => {
        if (active) {
          setPlayer(data);
          setLoading(false);
          // Save to history
          const personaname =
            (data as any)?.profile?.personaname || (data as any)?.personaname || `ID ${accountId}`;
          const avatarfull =
            (data as any)?.profile?.avatarfull || (data as any)?.avatarfull || '';
          const newEntry: PlayerHistoryEntry = {
            accountId,
            personaname,
            avatarfull,
            lastSeen: Date.now(),
          };
          setPlayerHistory((prev) => {
            const updated = addToHistory(prev, newEntry);
            saveHistory(updated);
            return updated;
          });
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const formattedError =
            err instanceof Error ? err : new Error(String(err) || 'Failed to fetch player profile');
          setError(formattedError);
          setPlayer(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accountId]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      accountId,
      account_id: accountId,
      player,
      loading,
      error,
      setAccountId,
      refetchPlayer,
      refreshPlayer: refetchPlayer,
      playerHistory,
      clearHistory,
    }),
    [accountId, player, loading, error, setAccountId, refetchPlayer, playerHistory, clearHistory]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

export default PlayerContext;
