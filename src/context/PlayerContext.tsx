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

export const DEFAULT_ACCOUNT_ID = 1242630127;

export const PlayerProvider: React.FC<PlayerProviderProps> = ({
  children,
  initialAccountId,
}) => {
  const [accountId, setAccountIdState] = useState<number | null>(
    initialAccountId !== undefined && initialAccountId !== null
      ? initialAccountId
      : DEFAULT_ACCOUNT_ID
  );
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const setAccountId = useCallback((id: number) => {
    setAccountIdState(id);
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
