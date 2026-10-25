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

export interface PlayerContextValue {
  accountId: number | null;
  account_id: number | null;
  player: Player | null;
  loading: boolean;
  error: Error | null;
  setAccountId: (id: number) => void;
  refetchPlayer: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
}

export const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export interface PlayerProviderProps {
  children: ReactNode;
  initialAccountId?: number;
}

const STORAGE_KEY = 'dotascope_account_id';

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

  const setAccountId = useCallback((id: number) => {
    setAccountIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
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
    }),
    [accountId, player, loading, error, setAccountId, refetchPlayer]
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
