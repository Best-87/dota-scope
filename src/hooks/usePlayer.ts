import { useState, useEffect, useCallback } from 'react';
import { getWinLoss, getHeroes, getTotals, getRankings } from '../api/opendota';
import type { WinLoss, HeroStats, PlayerTotal, HeroRanking } from '../api/types';

export interface UsePlayerResult {
  winLoss: WinLoss | null;
  heroes: HeroStats[];
  totals: PlayerTotal[];
  rankings: HeroRanking[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePlayer = (accountId: number | null | undefined): UsePlayerResult => {
  const [winLoss, setWinLoss] = useState<WinLoss | null>(null);
  const [heroes, setHeroes] = useState<HeroStats[]>([]);
  const [totals, setTotals] = useState<PlayerTotal[]>([]);
  const [rankings, setRankings] = useState<HeroRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayerData = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [wlData, heroesData, totalsData, rankingsData] = await Promise.all([
        getWinLoss(id),
        getHeroes(id),
        getTotals(id),
        getRankings(id),
      ]);

      setWinLoss(wlData ?? null);
      setHeroes(Array.isArray(heroesData) ? heroesData : []);
      setTotals(Array.isArray(totalsData) ? totalsData : []);
      setRankings(Array.isArray(rankingsData) ? rankingsData : []);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to fetch player stats');
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!accountId || accountId <= 0) {
      setWinLoss(null);
      setHeroes([]);
      setTotals([]);
      setRankings([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getWinLoss(accountId),
      getHeroes(accountId),
      getTotals(accountId),
      getRankings(accountId),
    ])
      .then(([wlData, heroesData, totalsData, rankingsData]) => {
        if (active) {
          setWinLoss(wlData ?? null);
          setHeroes(Array.isArray(heroesData) ? heroesData : []);
          setTotals(Array.isArray(totalsData) ? totalsData : []);
          setRankings(Array.isArray(rankingsData) ? rankingsData : []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const formattedError =
            err instanceof Error ? err : new Error(String(err) || 'Failed to fetch player stats');
          setError(formattedError);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accountId]);

  const refetch = useCallback(async () => {
    if (accountId && accountId > 0) {
      await fetchPlayerData(accountId);
    }
  }, [accountId, fetchPlayerData]);

  return {
    winLoss,
    heroes,
    totals,
    rankings,
    loading,
    error,
    refetch,
  };
};

export default usePlayer;
