import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRecentMatches, getMatches } from '../api/opendota';
import type { RecentMatch } from '../api/types';

export interface MatchFilters {
  hero_id?: number;
  lobby_type?: number;
  lane_role?: number;
  game_mode?: number;
  win?: number;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface UseMatchesResult {
  matches: RecentMatch[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 20;

export const useMatches = (
  accountId: number | null | undefined,
  filters?: MatchFilters
): UseMatchesResult => {
  const [matches, setMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Stable string comparison for filters object to avoid unnecessary re-triggers
  const filterKey = useMemo(() => JSON.stringify(filters || {}), [filters]);

  const hasSpecificFilters = useMemo(() => {
    if (!filters) return false;
    return (
      filters.hero_id !== undefined ||
      filters.lobby_type !== undefined ||
      filters.lane_role !== undefined ||
      filters.game_mode !== undefined ||
      filters.win !== undefined ||
      (filters.limit !== undefined && filters.limit !== DEFAULT_PAGE_SIZE) ||
      Boolean(filters.offset && filters.offset > 0)
    );
  }, [filters]);

  const limit = filters?.limit ?? DEFAULT_PAGE_SIZE;

  // Initial fetch or filter change
  useEffect(() => {
    let active = true;

    if (!accountId || accountId <= 0) {
      setMatches([]);
      setLoading(false);
      setLoadingMore(false);
      setError(null);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasMore(true);

    const initialFetch = async () => {
      try {
        let result: RecentMatch[];

        if (hasSpecificFilters) {
          result = await getMatches(accountId, {
            limit,
            offset: filters?.offset ?? 0,
            ...filters,
          });
        } else {
          result = await getRecentMatches(accountId);
        }

        if (active) {
          const list = Array.isArray(result) ? result : [];
          setMatches(list);
          if (list.length < limit) {
            setHasMore(false);
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          const formattedError =
            err instanceof Error ? err : new Error(String(err) || 'Failed to fetch matches');
          setError(formattedError);
          setMatches([]);
          setLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      active = false;
    };
  }, [accountId, filterKey, hasSpecificFilters, limit, filters]);

  // Load more pagination function
  const loadMore = useCallback(async () => {
    if (!accountId || accountId <= 0 || loading || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const currentOffset = matches.length;
      const nextBatch = await getMatches(accountId, {
        limit,
        offset: currentOffset,
        ...(filters || {}),
      });

      const nextList = Array.isArray(nextBatch) ? nextBatch : [];
      if (nextList.length === 0 || nextList.length < limit) {
        setHasMore(false);
      }

      setMatches((prev) => [...prev, ...nextList]);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to load more matches');
      setError(formattedError);
    } finally {
      setLoadingMore(false);
    }
  }, [accountId, loading, loadingMore, hasMore, matches.length, limit, filters]);

  // Refetch initial matches
  const refetch = useCallback(async () => {
    if (!accountId || accountId <= 0) {
      setMatches([]);
      return;
    }

    setLoading(true);
    setError(null);
    setHasMore(true);

    try {
      let result: RecentMatch[];
      if (hasSpecificFilters) {
        result = await getMatches(accountId, {
          limit,
          offset: filters?.offset ?? 0,
          ...filters,
        });
      } else {
        result = await getRecentMatches(accountId);
      }

      const list = Array.isArray(result) ? result : [];
      setMatches(list);
      if (list.length < limit) {
        setHasMore(false);
      }
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to refetch matches');
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  }, [accountId, hasSpecificFilters, limit, filters]);

  return {
    matches,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  };
};

export default useMatches;
