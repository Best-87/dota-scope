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
      const [wlRes, heroesRes, totalsRes, rankingsRes] = await Promise.allSettled([
        getWinLoss(id),
        getHeroes(id),
        getTotals(id),
        getRankings(id),
      ]);

      setWinLoss(wlRes.status === 'fulfilled' && wlRes.value ? wlRes.value : null);
      setHeroes(heroesRes.status === 'fulfilled' && Array.isArray(heroesRes.value) ? heroesRes.value : []);
      setTotals(totalsRes.status === 'fulfilled' && Array.isArray(totalsRes.value) ? totalsRes.value : []);
      setRankings(rankingsRes.status === 'fulfilled' && Array.isArray(rankingsRes.value) ? rankingsRes.value : []);

      // Only set error if every single request failed
      const allFailed = [wlRes, heroesRes, totalsRes, rankingsRes].every((r) => r.status === 'rejected');
      if (allFailed) {
        setError(new Error('No se pudieron obtener las estadísticas del jugador'));
      }
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

    Promise.allSettled([
      getWinLoss(accountId),
      getHeroes(accountId),
      getTotals(accountId),
      getRankings(accountId),
    ])
      .then(([wlRes, heroesRes, totalsRes, rankingsRes]) => {
        if (active) {
          setWinLoss(wlRes.status === 'fulfilled' && wlRes.value ? wlRes.value : null);
          setHeroes(heroesRes.status === 'fulfilled' && Array.isArray(heroesRes.value) ? heroesRes.value : []);
          setTotals(totalsRes.status === 'fulfilled' && Array.isArray(totalsRes.value) ? totalsRes.value : []);
          setRankings(rankingsRes.status === 'fulfilled' && Array.isArray(rankingsRes.value) ? rankingsRes.value : []);

          const allFailed = [wlRes, heroesRes, totalsRes, rankingsRes].every((r) => r.status === 'rejected');
          if (allFailed) {
            setError(new Error('No se pudieron obtener las estadísticas del jugador'));
          }
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
